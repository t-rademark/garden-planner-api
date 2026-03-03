import { Test, TestingModule } from '@nestjs/testing';
import { BedController } from './bed.controller';

describe('BedController', () => {
  let controller: BedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BedController],
    }).compile();

    controller = module.get<BedController>(BedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
