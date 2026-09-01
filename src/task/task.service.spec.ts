import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BedService } from '../bed/bed.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskService } from './task.service';
import { TaskRecurrence, TaskStatus } from './task.types';

describe('TaskService', () => {
  let service: TaskService;
  let bedService: { findOwnedBedOrThrow: jest.Mock };
  let prisma: {
    task: {
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      upsert: jest.Mock;
      delete: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    bed: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    bedService = {
      findOwnedBedOrThrow: jest.fn(),
    };
    prisma = {
      task: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      bed: { findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );

    service = new TaskService(
      bedService as unknown as BedService,
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lists tasks using the owner-scoped bed query without filters', async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await service.listForBed('user-a', 2);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        bedId: 2,
        bed: { garden: { ownerId: 'user-a' } },
      },
    });
  });

  it('filters tasks by due date', async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await service.listForBed('user-a', 2, { dueOn: '2026-09-01' });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        bedId: 2,
        bed: { garden: { ownerId: 'user-a' } },
        dueOn: new Date('2026-09-01T00:00:00.000Z'),
      },
    });
  });

  it('filters tasks by status', async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await service.listForBed('user-a', 2, { status: TaskStatus.DONE });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        bedId: 2,
        bed: { garden: { ownerId: 'user-a' } },
        status: TaskStatus.DONE,
      },
    });
  });

  it('combines due date and status filters', async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await service.listForBed('user-a', 2, {
      dueOn: '2026-09-01',
      status: TaskStatus.OPEN,
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        bedId: 2,
        bed: { garden: { ownerId: 'user-a' } },
        dueOn: new Date('2026-09-01T00:00:00.000Z'),
        status: TaskStatus.OPEN,
      },
    });
  });

  it('queries due-today tasks using the Perth calendar date', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T16:00:00.000Z'));
    prisma.task.findMany.mockResolvedValue([]);

    await service.listDueTodayForGarden('user-a', 3);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bed: { garden: { id: 3, ownerId: 'user-a' } },
          dueOn: new Date('2026-09-01T00:00:00.000Z'),
          status: TaskStatus.OPEN,
        },
      }),
    );
  });

  it('queries the garden walk using the Perth calendar date', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T15:59:59.999Z'));
    prisma.bed.findMany.mockResolvedValue([]);

    await service.getGardenWalk('user-a', 3);

    expect(prisma.bed.findMany).toHaveBeenCalledWith({
      where: { garden: { id: 3, ownerId: 'user-a' } },
      orderBy: { positionIndex: 'asc' },
      include: {
        tasks: {
          where: {
            dueOn: new Date('2026-08-31T00:00:00.000Z'),
            status: TaskStatus.OPEN,
          },
          orderBy: [{ dueOn: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  });

  it('does not create a task when the bed ownership check fails', async () => {
    bedService.findOwnedBedOrThrow.mockRejectedValue(
      new NotFoundException('Bed 2 not found'),
    );

    await expect(
      service.createForBed('user-a', 2, { title: 'Water seedlings' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it('rejects a recurring task without a due date', async () => {
    await expect(
      service.createForBed('user-a', 2, {
        title: 'Water seedlings',
        recurrence: TaskRecurrence.DAILY,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it.each([
    {
      recurrence: TaskRecurrence.DAILY,
      dueOn: new Date('2026-09-30T00:00:00.000Z'),
      nextDueOn: new Date('2026-10-01T00:00:00.000Z'),
    },
    {
      recurrence: TaskRecurrence.WEEKLY,
      dueOn: new Date('2026-12-28T00:00:00.000Z'),
      nextDueOn: new Date('2027-01-04T00:00:00.000Z'),
    },
  ])(
    'creates the next $recurrence occurrence when completing a task',
    async ({ recurrence, dueOn, nextDueOn }) => {
      const completedAt = new Date('2026-09-01T02:30:00.000Z');
      jest.useFakeTimers().setSystemTime(completedAt);
      prisma.task.findFirst.mockResolvedValue({
        id: 7,
        bedId: 2,
        title: 'Water seedlings',
        dueOn,
        recurrence,
        status: TaskStatus.OPEN,
        completedAt: null,
      });
      prisma.task.updateMany.mockResolvedValue({ count: 1 });
      prisma.task.upsert.mockResolvedValue({});
      prisma.task.findUniqueOrThrow.mockResolvedValue({});

      await service.update('user-a', 7, { status: TaskStatus.DONE });

      expect(prisma.task.upsert).toHaveBeenCalledWith({
        where: { generatedFromTaskId: 7 },
        update: {},
        create: {
          bedId: 2,
          generatedFromTaskId: 7,
          title: 'Water seedlings',
          dueOn: nextDueOn,
          recurrence,
          status: TaskStatus.OPEN,
        },
      });
    },
  );

  it('does not generate a duplicate after another completion wins the transition', async () => {
    prisma.task.findFirst.mockResolvedValue({
      id: 7,
      bedId: 2,
      title: 'Water seedlings',
      dueOn: new Date('2026-09-01T00:00:00.000Z'),
      recurrence: TaskRecurrence.DAILY,
      status: TaskStatus.OPEN,
      completedAt: null,
    });
    prisma.task.updateMany.mockResolvedValue({ count: 0 });
    prisma.task.findUniqueOrThrow.mockResolvedValue({
      id: 7,
      status: TaskStatus.DONE,
    });

    await service.update('user-a', 7, { status: TaskStatus.DONE });

    expect(prisma.task.upsert).not.toHaveBeenCalled();
    expect(prisma.task.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 7 },
    });
  });

  it('does not allow a due date to be removed from a recurring task', async () => {
    prisma.task.findFirst.mockResolvedValue({
      id: 7,
      bedId: 2,
      title: 'Water seedlings',
      dueOn: new Date('2026-09-01T00:00:00.000Z'),
      recurrence: TaskRecurrence.WEEKLY,
      status: TaskStatus.OPEN,
      completedAt: null,
    });

    await expect(
      service.update('user-a', 7, { dueOn: null }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('records the completion time when a task is completed', async () => {
    const completedAt = new Date('2026-09-01T02:30:00.000Z');
    jest.useFakeTimers().setSystemTime(completedAt);
    prisma.task.findFirst.mockResolvedValue({
      id: 7,
      bedId: 2,
      title: 'Water seedlings',
      dueOn: null,
      recurrence: TaskRecurrence.NONE,
      status: TaskStatus.OPEN,
      completedAt: null,
    });
    prisma.task.updateMany.mockResolvedValue({ count: 1 });
    prisma.task.findUniqueOrThrow.mockResolvedValue({});

    await service.update('user-a', 7, { status: TaskStatus.DONE });

    expect(prisma.task.updateMany).toHaveBeenCalledWith({
      where: { id: 7, status: TaskStatus.OPEN },
      data: {
        status: TaskStatus.DONE,
        completedAt,
        updatedAt: completedAt,
      },
    });
    expect(prisma.task.upsert).not.toHaveBeenCalled();
  });

  it('preserves the original completion time when an already-done task is updated', async () => {
    const originalCompletion = new Date('2026-08-31T03:00:00.000Z');
    const updateTime = new Date('2026-09-01T02:30:00.000Z');
    jest.useFakeTimers().setSystemTime(updateTime);
    prisma.task.findFirst.mockResolvedValue({
      id: 7,
      bedId: 2,
      title: 'Water seedlings',
      dueOn: new Date('2026-09-01T00:00:00.000Z'),
      recurrence: TaskRecurrence.DAILY,
      status: TaskStatus.DONE,
      completedAt: originalCompletion,
    });
    prisma.task.update.mockResolvedValue({});

    await service.update('user-a', 7, { status: TaskStatus.DONE });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        status: TaskStatus.DONE,
        completedAt: originalCompletion,
        updatedAt: updateTime,
      },
    });
    expect(prisma.task.upsert).not.toHaveBeenCalled();
  });

  it('clears the completion time when a task is reopened', async () => {
    const updateTime = new Date('2026-09-01T02:30:00.000Z');
    jest.useFakeTimers().setSystemTime(updateTime);
    prisma.task.findFirst.mockResolvedValue({
      id: 7,
      bedId: 2,
      title: 'Water seedlings',
      dueOn: null,
      recurrence: TaskRecurrence.NONE,
      status: TaskStatus.DONE,
      completedAt: new Date('2026-08-31T03:00:00.000Z'),
    });
    prisma.task.update.mockResolvedValue({});

    await service.update('user-a', 7, { status: TaskStatus.OPEN });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        status: TaskStatus.OPEN,
        completedAt: null,
        updatedAt: updateTime,
      },
    });
  });

  it('leaves completion metadata unchanged for unrelated updates', async () => {
    const updateTime = new Date('2026-09-01T02:30:00.000Z');
    jest.useFakeTimers().setSystemTime(updateTime);
    prisma.task.findFirst.mockResolvedValue({
      id: 7,
      bedId: 2,
      title: 'Water seedlings',
      dueOn: null,
      recurrence: TaskRecurrence.NONE,
      status: TaskStatus.DONE,
      completedAt: new Date('2026-08-31T03:00:00.000Z'),
    });
    prisma.task.update.mockResolvedValue({});

    await service.update('user-a', 7, { title: 'Updated title' });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        title: 'Updated title',
        updatedAt: updateTime,
      },
    });
  });

  it('does not update a task that is not owned by the user', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(
      service.update('user-a', 7, { title: 'Changed title' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        id: 7,
        bed: { garden: { ownerId: 'user-a' } },
      },
    });
  });

  it('does not delete a task that is not owned by the user', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-a', 7)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.task.delete).not.toHaveBeenCalled();
  });
});
