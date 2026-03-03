import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BedService } from '../bed/bed.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskRecurrence, TaskStatus } from './task.types';

function todayPerth(): string {
  // Produces YYYY-MM-DD in Australia/Perth
  // en-CA gives ISO-ish date format (YYYY-MM-DD) reliably
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

@Injectable()
export class TaskService {
  private nextId = 1;
  private tasks: Task[] = [];

  constructor(private readonly bedService: BedService) {}

  listForBed(
    ownerId: string,
    bedId: number,
    opts?: { dueOn?: string; status?: TaskStatus },
  ): Task[] {
    // Ownership check via bed -> garden
    this.bedService.getOwnedBedOrThrow(ownerId, bedId);

    let result = this.tasks.filter((t) => t.bedId === bedId);

    if (opts?.dueOn) result = result.filter((t) => t.dueOn === opts.dueOn);
    if (opts?.status) result = result.filter((t) => t.status === opts.status);

    // Simple ordering: dueOn first (undefined last), then id
    result.sort((a, b) => {
      const da = a.dueOn ?? '9999-12-31';
      const db = b.dueOn ?? '9999-12-31';
      if (da < db) return -1;
      if (da > db) return 1;
      return a.id - b.id;
    });

    return result;
  }

  listDueTodayForBed(ownerId: string, bedId: number): Task[] {
    const dueOn = todayPerth();
    return this.listForBed(ownerId, bedId, { dueOn, status: TaskStatus.OPEN });
  }

  createForBed(ownerId: string, bedId: number, dto: CreateTaskDto): Task {
    this.bedService.getOwnedBedOrThrow(ownerId, bedId);

    const title = dto.title.trim();
    if (!title) throw new BadRequestException('title is required');

    const now = new Date();
    const task: Task = {
      id: this.nextId++,
      bedId,
      title,
      dueOn: dto.dueOn,
      recurrence: dto.recurrence ?? TaskRecurrence.NONE,
      status: TaskStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.push(task);
    return task;
  }

  getOwnedTaskOrThrow(ownerId: string, taskId: number): Task {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Ownership check via bed
    this.bedService.getOwnedBedOrThrow(ownerId, task.bedId);
    return task;
  }

  update(ownerId: string, taskId: number, dto: UpdateTaskDto): Task {
    const task = this.getOwnedTaskOrThrow(ownerId, taskId);

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.dueOn !== undefined) task.dueOn = dto.dueOn;
    if (dto.recurrence !== undefined) task.recurrence = dto.recurrence;

    if (dto.status !== undefined) {
      task.status = dto.status;
      task.completedAt = dto.status === TaskStatus.DONE ? new Date() : undefined;
    }

    task.updatedAt = new Date();
    return task;
  }

  remove(ownerId: string, taskId: number): { deleted: true } {
    this.getOwnedTaskOrThrow(ownerId, taskId);
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    return { deleted: true };
  }
}