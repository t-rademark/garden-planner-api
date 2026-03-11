import { ForbiddenException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGardenDto } from './dto/create-garden.dto';
import { UpdateGardenDto } from './dto/update-garden.dto';
import { Region } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type Garden = {
    id: number;
    ownerId: string;
    name: string;
    region: Region;
    createdAt: Date;
    updatedAt: Date;
};

@Injectable()
export class GardenService {
    private nextId = 1;
    private gardens: Garden[] = [];

    constructor(private prisma: PrismaService) {}

    listForOwner(ownerId: string) {
        return this.prisma.garden.findMany({
            where: { ownerId },
            orderBy: { id: 'asc' },
        });
    }

    createForOwner(ownerId: string, dto: CreateGardenDto) {
        return this.prisma.garden.create({
            data: {
                ownerId,
                name: dto.name.trim(),
                region: dto.region,
            },
        });
    }

    getOwndedGardenOrThrow(ownerId: string, gardenId: number): Garden {
        const garden = this.gardens.find((g) => g.id === gardenId);
        
        if (!garden) throw new NotFoundException(`Garden not found`);
        if (garden.ownerId !== ownerId) throw new ForbiddenException(`You do not have access to this garden`);
        return garden;
    }

    getOne(ownerId: string, gardenId: number): Garden {
        return this.getOwndedGardenOrThrow(ownerId, gardenId);
    }

    update(ownerId: string, gardenId: number, dto: UpdateGardenDto): Garden {
        const garden = this.getOwndedGardenOrThrow(ownerId, gardenId);

        if (dto.name !== undefined) {
            garden.name = dto.name.trim();
        }
        if (dto.region !== undefined) {
            garden.region = dto.region;
        }
        garden.updatedAt = new Date();

        return garden;
    }

    remove(ownerId: string, gardenId: number): { deleted: true} {
        const garden = this.getOwndedGardenOrThrow(ownerId, gardenId);
        
        this.gardens = this.gardens.filter((g) => g.id !== garden.id);
        return { deleted: true };
    }   
}
