import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGardenDto } from './dto/create-garden.dto';
import { UpdateGardenDto } from './dto/update-garden.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GardenService {

    constructor(private prisma: PrismaService) {}

    async listForOwner(ownerId: string) {
        return this.prisma.garden.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async createForOwner(ownerId: string, dto: CreateGardenDto) {
        return this.prisma.garden.create({
            data: {
                ownerId,
                name: dto.name.trim(),
                region: dto.region,
            },
        });
    }

    async getOne(ownerId: string, gardenId: number) {
        return this.findOwnedGardenOrThrow(ownerId, gardenId);
    }

    async update(ownerId: string, gardenId: number, dto: UpdateGardenDto) {
        await this.findOwnedGardenOrThrow(ownerId, gardenId);

        return this.prisma.garden.update({
            where: { id: gardenId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
                ...(dto.region !== undefined ? { region: dto.region } : {}),
            },
        });
    }

    async remove(ownerId: string, gardenId: number) {
        await this.findOwnedGardenOrThrow(ownerId, gardenId);
        
        return this.prisma.garden.delete({
            where: { id: gardenId },
        });
    }   

    async findOwnedGardenOrThrow(ownerId: string, gardenId: number) {
        const garden = await this.prisma.garden.findFirst({
            where: { 
                id: gardenId,
                ownerId,
            },
            include: { 
                beds: {
                    orderBy: { positionIndex: 'asc' },
                },
            },
        });
        
        if (!garden) {
            throw new NotFoundException(`Garden ${gardenId} not found`);
        }
        
        return garden;
    }
}
