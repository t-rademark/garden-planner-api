import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from '../auth/user.decorator';
import { CreateGardenDto } from './dto/create-garden.dto';
import { UpdateGardenDto } from './dto/update-garden.dto';
import { GardenService } from './garden.service';

@UseGuards(AuthGuard('jwt'))
@Controller('gardens')
export class GardenController {
    constructor(
        private readonly gardenService: GardenService,
    ) {}

    @Get()
    list(@UserId() userId: string) {
        return this.gardenService.listForOwner(userId);
    }

    @Post()
    create(@UserId() userId: string, @Body() dto: CreateGardenDto) {
        return this.gardenService.createForOwner(userId, dto);
    }

    @Get(':gardenId')
    getOne(@UserId() userId: string, @Param('gardenId', ParseIntPipe) gardenId: number) {
        return this.gardenService.getOne(userId, gardenId);
    }

    @Patch(':gardenId')
    update(
        @UserId() userId: string, 
        @Param('gardenId', ParseIntPipe) gardenId: number, 
        @Body() dto: UpdateGardenDto,
    ) {
        return this.gardenService.update(userId, gardenId, dto);
    }

    @Delete(':gardenId')
    remove(@UserId() userId: string, @Param('gardenId', ParseIntPipe) gardenId: number) {
        return this.gardenService.remove(userId, gardenId);
    }
}
