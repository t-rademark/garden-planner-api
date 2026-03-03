import { ForbiddenException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGardenDto } from './dto/create-garden.dto';
import { UpdateGardenDto } from './dto/update-garden.dto';
import { Region } from './region';

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

    listForOwner(ownerId: string) {
        return this.gardens.filter((g) => g.ownerId === ownerId);
    }

    createForOwner(ownerId: string, dto: CreateGardenDto): Garden {
        const now = new Date();
        const garden: Garden = {
            id: this.nextId++,
            ownerId,
            name: dto.name.trim(),
            region: dto.region,
            createdAt: now,
            updatedAt: now,
        };

        this.gardens.push(garden);
        return garden;
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
