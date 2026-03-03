import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GardenService } from 'src/garden/garden.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { Bed } from './bed.types';

@Injectable()
export class BedService {
    private nextId = 1;
    private beds: Bed[] = [];

    constructor(private readonly gardenService: GardenService) {}

    listForGarden(ownerId: string, gardenId: number): Bed[] {
        this.gardenService.getOwndedGardenOrThrow(ownerId, gardenId);

        return this.beds
            .filter((b) => b.gardenId === gardenId)
            .sort((a, b) => a.positionIndex - b.positionIndex);
    }

    createForGarden(ownerId: string, gardenId: number, dto: CreateBedDto): Bed {
        this.gardenService.getOwndedGardenOrThrow(ownerId, gardenId);

        const name = dto.name.trim();
        const notes = dto.notes?.trim();
        const positionIndex = dto.positionIndex;

        const collision = this.beds.find(
            (b) => b.gardenId === gardenId && b.positionIndex === positionIndex,
        );
        if (collision) {
            throw new BadRequestException(`positionIndex ${positionIndex} already used in this garden`);
        }

        const now = new Date();
        const bed: Bed = {
            id: this.nextId++,
            gardenId,
            name,
            positionIndex,
            notes,
            createdAt: now,
            updatedAt: now,
        };
        
        this.beds.push(bed);
        return bed;
    }

    getOwnedBedOrThrow(ownerId: string, bedId: number): Bed {
        const bed = this.beds.find((b) => b.id === bedId);
        if (!bed) throw new NotFoundException(`Bed not found`);

        // Ownership checkvia parent garden
        this.gardenService.getOwndedGardenOrThrow(ownerId, bed.gardenId);
        return bed;
    }

    update(ownerId: string, bedId: number, dto: UpdateBedDto): Bed {
        const bed = this.getOwnedBedOrThrow(ownerId, bedId);

        if (dto.positionIndex !== undefined) {
            const collision = this.beds.find(
                (b) =>
                    b.gardenId === bed.gardenId &&
                    b.positionIndex === dto.positionIndex &&
                    b.id !== bedId,
            );
            if (collision) {
                throw new BadRequestException(
                    `positionIndex ${dto.positionIndex} already used in this garden`
                );
            }
            bed.positionIndex = dto.positionIndex;
        }

        if (dto.name !== undefined) {
            bed.name = dto.name.trim();
        }
        if (dto.notes !== undefined) {
            bed.notes = dto.notes.trim();
        }

        bed.updatedAt = new Date();
        return bed;
    }

    remove(ownerId: string, bedId: number): { deleted: true } {
        this.getOwnedBedOrThrow(ownerId, bedId);
        this.beds = this.beds.filter((b) => b.id !== bedId);
        return { deleted: true };
    }
}
