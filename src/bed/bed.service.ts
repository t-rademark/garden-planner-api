import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GardenService } from 'src/garden/garden.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BedService {

    constructor(
        private readonly gardenService: GardenService, 
        private readonly prisma: PrismaService) 
    {}

    async listForGarden(ownerId: string, gardenId: number) {
        return this.prisma.bed.findMany({
            where: { 
                gardenId,
                garden: {
                    ownerId,
                },
            },
            orderBy: { positionIndex: 'asc' },
        });
    }

    async createForGarden(ownerId: string, gardenId: number, dto: CreateBedDto) {
        await this.gardenService.findOwnedGardenOrThrow(ownerId, gardenId);

        try {
            return await this.prisma.bed.create({
                data: {
                    gardenId,
                    name: dto.name.trim(),
                    positionIndex: dto.positionIndex,
                    notes: dto.notes?.trim(),
                },
            });
        } catch (error) {
            this.handleBedWriteError(error, gardenId, dto.positionIndex);
        }
    }

    async update(ownerId: string, bedId: number, dto: UpdateBedDto) {
        const existingBed = await this.findOwnedBedOrThrow(ownerId, bedId);

        try {
            return this.prisma.bed.update({
                where: { id: bedId },
                data: {
                    ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
                    ...(dto.positionIndex !== undefined ? { positionIndex: dto.positionIndex } : {}),
                    ...(dto.notes !== undefined ? { notes: dto.notes.trim() } : {}),
                },
            });
        } catch (error) {
            this.handleBedWriteError(error, existingBed.gardenId, dto.positionIndex);
        }
    }

    async remove(ownerId: string, bedId: number) {
        await this.findOwnedBedOrThrow(ownerId, bedId);

        return this.prisma.bed.delete({
            where: { id: bedId },
        });
    }

    async findOwnedBedOrThrow(ownerId: string, bedId: number) {
        const bed = await this.prisma.bed.findFirst({
            where: { 
                id: bedId,
                garden: {
                    ownerId,
                },
            },
            include: {
                tasks: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!bed) {
            throw new NotFoundException(`Bed ${bedId} not found`);
        }
        
        return bed;
    }

    private handleBedWriteError(error: unknown, gardenId: number, positionIndex?: number): never {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002' // Unique constraint failed
        ) {
            throw new BadRequestException(
                `A bed with positionIndex ${positionIndex} already exists in garden ${gardenId}`,
            );  
        }   
        
        throw error;
    }
}
