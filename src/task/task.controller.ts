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
import { TaskStatus } from './task.types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
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

  @Get('gardens/:gardenId/tasks/due-today')
  dueTodayForGarden(
    @UserId() userId: string,
    @Param('gardenId', ParseIntPipe) gardenId: number,
  ) {
    return this.taskService.listDueTodayForGarden(userId, gardenId);
  }

  @Get('gardens/:gardenId/walk')
  getGardenWalk(
    @UserId() userId: string,
    @Param('gardenId', ParseIntPipe) gardenId: number,
  ) {
    return this.taskService.getGardenWalk(userId, gardenId);
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