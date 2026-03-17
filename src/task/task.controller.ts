import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from '../auth/user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { BedService } from '../bed/bed.service';
import { GardenService } from '../garden/garden.service';
import { TaskStatus } from './task.types';

function todayPerth(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

@UseGuards(AuthGuard('jwt'))
@Controller()
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly bedService: BedService,
    private readonly gardenService: GardenService
) {}

  // List tasks for a bed, with optional filters:
  // /beds/:bedId/tasks?dueOn=YYYY-MM-DD&status=OPEN|DONE
  @Get('beds/:bedId/tasks')
  listForBed(
    @UserId() userId: string,
    @Param('bedId', ParseIntPipe) bedId: number,
    @Query('dueOn') dueOn?: string,
    @Query('status') status?: TaskStatus,
  ) {
    return this.taskService.listForBed(userId, bedId, { dueOn, status });
  }

  @Post('beds/:bedId/tasks')
  createForBed(
    @UserId() userId: string,
    @Param('bedId', ParseIntPipe) bedId: number,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.createForBed(userId, bedId, dto);
  }

  @Patch('tasks/:taskId')
  update(
    @UserId() userId: string,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(userId, taskId, dto);
  }

  @Delete('tasks/:taskId')
  remove(@UserId() userId: string, @Param('taskId', ParseIntPipe) taskId: number) {
    return this.taskService.remove(userId, taskId);
  }
}