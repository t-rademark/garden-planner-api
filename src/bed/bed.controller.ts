import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/auth/user.decorator';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { BedService } from './bed.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Beds')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class BedController {
    constructor(private readonly bedService: BedService) {}

    // Nested under a garden (recommended for create and list)
    @Get('gardens/:gardenId/beds')
    listForGarden(
        @UserId() userId: string, 
        @Param('gardenId', ParseIntPipe) gardenId: number,
    ) {
        return this.bedService.listForGarden(userId, gardenId);
    }

    @Post('gardens/:gardenId/beds')
    createForGarden(
        @UserId() userId: string, 
        @Param('gardenId', ParseIntPipe) gardenId: number, 
        @Body() dto: CreateBedDto,
    ) {
        return this.bedService.createForGarden(userId, gardenId, dto);
    }

    // Direct bed operation
    @Patch('beds/:bedId')
    update(
        @UserId() userId: string, 
        @Param('bedId', ParseIntPipe) bedId: number, 
        @Body() dto: UpdateBedDto,
    ) {
        return this.bedService.update(userId, bedId, dto);
    }

    @Delete('beds/:bedId')
    remove(@UserId() userId: string, @Param('bedId', ParseIntPipe) bedId: number) {
        return this.bedService.remove(userId, bedId);
    }
}
