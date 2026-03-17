import { Injectable, NotFoundException } from '@nestjs/common';
import { BedService } from '../bed/bed.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskRecurrence, TaskStatus } from './task.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {

  constructor(
    private readonly bedService: BedService,
    private readonly prisma: PrismaService,
  ) { }

  async listForBed(ownerId: string, bedId: number, opts?: { dueOn?: string; status?: TaskStatus }) {
    return this.prisma.task.findMany({
      where: {
        bedId,
        bed: {
          garden: {
            ownerId,
          },
        },
      },
    });
  }

  async listDueTodayForGarden(ownerId: string, gardenId: number) {
    const now = new Date();

    // Convert "now" to Perth time
    const perthNow = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Perth' }));

    const startOfDay = new Date(perthNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(perthNow);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.task.findMany({
      where: {
        bed: {
          garden: {
            id: gardenId,
            ownerId,
          },
        },
        dueOn: {
          gte: startOfDay,
          lte: endOfDay,
        },
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

  async createForBed(ownerId: string, bedId: number, dto: CreateTaskDto) {
    this.bedService.findOwnedBedOrThrow(ownerId, bedId);

    const now = new Date();

    return await this.prisma.task.create({
      data: {
        bedId,
        title: dto.title.trim(),
        dueOn: dto.dueOn ? new Date(dto.dueOn) : undefined,
        recurrence: dto.recurrence ?? TaskRecurrence.NONE,
        status: TaskStatus.OPEN,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  async update(ownerId: string, taskId: number, dto: UpdateTaskDto) {
    const task = this.findOwnedTaskOrThrow(ownerId, taskId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.dueOn !== undefined ? { dueOn: dto.dueOn ? new Date(dto.dueOn) : null } : {}),
        ...(dto.recurrence !== undefined ? { recurrence: dto.recurrence } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async remove(ownerId: string, taskId: number) {
    this.findOwnedTaskOrThrow(ownerId, taskId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  private async findOwnedTaskOrThrow(ownerId: string, taskId: number) {
    const task = this.prisma.task.findFirst({
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
      throw new NotFoundException(`Task with id ${taskId} not found for this user`);
    }
    
    return task;
  }
}