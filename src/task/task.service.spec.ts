import { NotFoundException } from '@nestjs/common';
import { BedService } from '../bed/bed.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let bedService: { findOwnedBedOrThrow: jest.Mock };
  let prisma: {
    task: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    bed: { findMany: jest.Mock };
  };

  beforeEach(() => {
    bedService = {
      findOwnedBedOrThrow: jest.fn(),
    };
    prisma = {
      task: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      bed: { findMany: jest.fn() },
    };

    service = new TaskService(
      bedService as unknown as BedService,
      prisma as unknown as PrismaService,
    );
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
