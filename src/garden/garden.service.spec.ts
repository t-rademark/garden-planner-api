import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GardenService } from './garden.service';

describe('GardenService ownership', () => {
  let service: GardenService;
  let prisma: {
    garden: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      garden: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new GardenService(prisma as unknown as PrismaService);
  });

  it('scopes garden listings to the authenticated owner', async () => {
    prisma.garden.findMany.mockResolvedValue([]);

    await service.listForOwner('user-a');

    expect(prisma.garden.findMany).toHaveBeenCalledWith({
      where: { ownerId: 'user-a' },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('returns 404 when reading a garden not owned by the user', async () => {
    prisma.garden.findFirst.mockResolvedValue(null);

    await expect(service.getOne('user-a', 4)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.garden.findFirst).toHaveBeenCalledWith({
      where: { id: 4, ownerId: 'user-a' },
      include: { beds: { orderBy: { positionIndex: 'asc' } } },
    });
  });

  it('does not update a garden not owned by the user', async () => {
    prisma.garden.findFirst.mockResolvedValue(null);

    await expect(
      service.update('user-a', 4, { name: 'Other garden' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.garden.update).not.toHaveBeenCalled();
  });

  it('does not delete a garden not owned by the user', async () => {
    prisma.garden.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-a', 4)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.garden.delete).not.toHaveBeenCalled();
  });
});
