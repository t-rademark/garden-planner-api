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

  // Due today (Perth) for a bed
  @Get('beds/:bedId/tasks/due-today')
  dueToday(@UserId() userId: string, @Param('bedId', ParseIntPipe) bedId: number) {
    return this.taskService.listDueTodayForBed(userId, bedId);
  }

  /*
  @Get('gardens/:gardenId/today-walk')
  todayWalk(
    @UserId() userId: string,
    @Param('gardenId', ParseIntPipe) gardenId: number,
    @Query('includeUndated') includeUndated?: string,
  ) {
  
    // Ensure the garden exists + is owned by this user
    this.gardenService.findOwnedGardenOrThrow(userId, gardenId);

    const dueOn = todayPerth();
    const includeAnytime = includeUndated === 'true' || includeUndated === '1';

    // Beds are already returned sorted by positionIndex
    const beds = this.bedService.listForGarden(userId, gardenId);

    const result = beds.map((bed) => {
        // Start with OPEN tasks due today
        const dueToday = this.taskService.listForBed(userId, bed.id, { dueOn, status: TaskStatus.OPEN });

        if (includeAnytime) {
            return { ...bed, tasks: dueToday };
        }

        // Add OPEN tasks with no dueOn (anytime)
        const anytime = this.taskService
            .listForBed(userId, bed.id, { status: TaskStatus.OPEN })
            .filter((t) => !t.dueOn);

        // Combine (avoid dupes just in case)
        const tasks = [...dueToday];
        const existingIds = new Set(tasks.map((t) => t.id));
        for (const t of anytime) {
            if (!existingIds.has(t.id)) tasks.push(t);
        }

        // Optional: sort so due-today first. anytime last
        tasks.sort((a, b) => {
            const da = a.dueOn ?? '9999-12-31';
            const db = b.dueOn ?? '9999-12-31';
            if (da < db) return -1;
            if (da > db) return 1;
            return a.id - b.id;
        });

        return { ...bed, tasks };
    });

    return {
      gardenId,
      dueOn,
      includeUndated: includeAnytime,
      beds: result,
    };
  }
    */
  
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