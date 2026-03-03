import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { BedModule } from '../bed/bed.module';
import { GardenModule } from '../garden/garden.module';

@Module({
  imports: [BedModule, GardenModule],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
