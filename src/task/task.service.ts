import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BedService } from '../bed/bed.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskRecurrence, TaskStatus } from './task.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { dateOnlyToUtc, getPerthTodayDate } from 'src/common/utils/date.utils';

@Injectable()
export class TaskService {
  constructor(
    private readonly bedService: BedService,
    private readonly prisma: PrismaService,
  ) {}

  async listForBed(
    ownerId: string,
    bedId: number,
    filters: ListTasksQueryDto = {},
  ) {
    return this.prisma.task.findMany({
      where: {
        bedId,
        bed: {
          garden: {
            ownerId,
          },
        },
        ...(filters.dueOn !== undefined
          ? { dueOn: dateOnlyToUtc(filters.dueOn) }
          : {}),
        ...(filters.status !== undefined ? { status: filters.status } : {}),
      },
    });
  }

  async listDueTodayForGarden(ownerId: string, gardenId: number) {
    const today = getPerthTodayDate();

    return this.prisma.task.findMany({
      where: {
        bed: {
          garden: {
            id: gardenId,
            ownerId,
          },
        },
        dueOn: today,
        status: TaskStatus.OPEN,
      },
      include: {
        bed: true,
      },
      orderBy: [
        {
          bed: {
            positionIndex: 'asc',
          },
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  async getGardenWalk(ownerId: string, gardenId: number) {
    const today = getPerthTodayDate();

    return this.prisma.bed.findMany({
      where: {
        garden: {
          id: gardenId,
          ownerId,
        },
      },
      orderBy: {
        positionIndex: 'asc',
      },
      include: {
        tasks: {
          where: {
            dueOn: today,
            status: TaskStatus.OPEN,
          },
          orderBy: [{ dueOn: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async createForBed(ownerId: string, bedId: number, dto: CreateTaskDto) {
    await this.bedService.findOwnedBedOrThrow(ownerId, bedId);

    const now = new Date();
    const dueOn = dto.dueOn ? dateOnlyToUtc(dto.dueOn) : null;
    const recurrence = dto.recurrence ?? TaskRecurrence.NONE;

    this.assertRecurrenceHasDueDate(recurrence, dueOn);

    return this.prisma.task.create({
      data: {
        bedId,
        title: dto.title.trim(),
        dueOn,
        recurrence,
        status: TaskStatus.OPEN,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  async update(ownerId: string, taskId: number, dto: UpdateTaskDto) {
    const now = new Date();

    return this.prisma.$transaction(async (transaction) => {
      const existingTask = await transaction.task.findFirst({
        where: {
          id: taskId,
          bed: {
            garden: {
              ownerId,
            },
          },
        },
      });

      if (!existingTask) {
        throw new NotFoundException(
          `Task with id ${taskId} not found for this user`,
        );
      }

      const effectiveDueOn =
        dto.dueOn !== undefined
          ? dto.dueOn
            ? dateOnlyToUtc(dto.dueOn)
            : null
          : existingTask.dueOn;
      const effectiveRecurrence =
        dto.recurrence ?? (existingTask.recurrence as TaskRecurrence);

      this.assertRecurrenceHasDueDate(effectiveRecurrence, effectiveDueOn);

      const updateData = {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.dueOn !== undefined ? { dueOn: effectiveDueOn } : {}),
        ...(dto.recurrence !== undefined ? { recurrence: dto.recurrence } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.status === TaskStatus.DONE
          ? { completedAt: existingTask.completedAt ?? now }
          : {}),
        ...(dto.status === TaskStatus.OPEN ? { completedAt: null } : {}),
        updatedAt: now,
      };

      const isNewCompletion =
        dto.status === TaskStatus.DONE &&
        (existingTask.status as TaskStatus) !== TaskStatus.DONE;

      if (!isNewCompletion) {
        return transaction.task.update({
          where: { id: taskId },
          data: updateData,
        });
      }

      const completion = await transaction.task.updateMany({
        where: {
          id: taskId,
          status: TaskStatus.OPEN,
        },
        data: updateData,
      });

      if (completion.count === 0) {
        return transaction.task.findUniqueOrThrow({
          where: { id: taskId },
        });
      }

      if (
        effectiveRecurrence !== TaskRecurrence.NONE &&
        effectiveDueOn !== null
      ) {
        const recurrenceDays =
          effectiveRecurrence === TaskRecurrence.DAILY ? 1 : 7;
        const nextDueOn = new Date(effectiveDueOn);
        nextDueOn.setUTCDate(nextDueOn.getUTCDate() + recurrenceDays);

        await transaction.task.upsert({
          where: { generatedFromTaskId: taskId },
          update: {},
          create: {
            bedId: existingTask.bedId,
            generatedFromTaskId: taskId,
            title: dto.title?.trim() ?? existingTask.title,
            dueOn: nextDueOn,
            recurrence: effectiveRecurrence,
            status: TaskStatus.OPEN,
          },
        });
      }

      return transaction.task.findUniqueOrThrow({
        where: { id: taskId },
      });
    });
  }

  async remove(ownerId: string, taskId: number) {
    await this.findOwnedTaskOrThrow(ownerId, taskId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  private async findOwnedTaskOrThrow(ownerId: string, taskId: number) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        bed: {
          garden: {
            ownerId,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(
        `Task with id ${taskId} not found for this user`,
      );
    }

    return task;
  }

  private assertRecurrenceHasDueDate(
    recurrence: TaskRecurrence,
    dueOn: Date | null,
  ): void {
    if (recurrence !== TaskRecurrence.NONE && dueOn === null) {
      throw new BadRequestException('Recurring tasks require a due date');
    }
  }
}
