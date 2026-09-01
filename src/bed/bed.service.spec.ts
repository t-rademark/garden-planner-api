import { NotFoundException } from '@nestjs/common';
import { GardenService } from '../garden/garden.service';
import { PrismaService } from '../prisma/prisma.service';
import { BedService } from './bed.service';

describe('BedService ownership', () => {
  let service: BedService;
  let gardenService: { findOwnedGardenOrThrow: jest.Mock };
  let prisma: {
    bed: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    gardenService = {
      findOwnedGardenOrThrow: jest.fn(),
    };
    prisma = {
      bed: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new BedService(
      gardenService as unknown as GardenService,
      prisma as unknown as PrismaService,
    );
  });

  it('scopes bed listings through the garden owner', async () => {
    prisma.bed.findMany.mockResolvedValue([]);

    await service.listForGarden('user-a', 4);

    expect(prisma.bed.findMany).toHaveBeenCalledWith({
      where: { gardenId: 4, garden: { ownerId: 'user-a' } },
      orderBy: { positionIndex: 'asc' },
    });
  });

  it('does not create a bed in a garden not owned by the user', async () => {
    gardenService.findOwnedGardenOrThrow.mockRejectedValue(
      new NotFoundException('Garden 4 not found'),
    );

    await expect(
      service.createForGarden('user-a', 4, {
        name: 'Vegetables',
        positionIndex: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.bed.create).not.toHaveBeenCalled();
  });

  it('does not update a bed not owned by the user', async () => {
    prisma.bed.findFirst.mockResolvedValue(null);

    await expect(
      service.update('user-a', 9, { name: 'Other bed' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.bed.update).not.toHaveBeenCalled();
    expect(prisma.bed.findFirst).toHaveBeenCalledWith({
      where: { id: 9, garden: { ownerId: 'user-a' } },
      include: { tasks: { orderBy: { createdAt: 'asc' } } },
    });
  });

  it('does not delete a bed not owned by the user', async () => {
    prisma.bed.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-a', 9)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.bed.delete).not.toHaveBeenCalled();
  });
});
