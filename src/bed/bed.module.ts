import { Module } from '@nestjs/common';
import { BedController } from './bed.controller';
import { BedService } from './bed.service';
import { GardenModule } from '../garden/garden.module';

@Module({
  imports: [GardenModule],
  controllers: [BedController],
  providers: [BedService],
  exports: [BedService],
})
export class BedModule {}
