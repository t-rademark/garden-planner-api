import { BedController } from './bed.controller';
import { BedService } from './bed.service';

describe('BedController', () => {
  let controller: BedController;
  let service: {
    listForGarden: jest.Mock;
    createForGarden: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    service = {
      listForGarden: jest.fn(),
      createForGarden: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new BedController(service as unknown as BedService);
  });

  it('delegates listing and creation through the owner and garden', async () => {
    const dto = { name: 'Vegetables', positionIndex: 1 };

    await controller.listForGarden('user-a', 3);
    await controller.createForGarden('user-a', 3, dto);

    expect(service.listForGarden).toHaveBeenCalledWith('user-a', 3);
    expect(service.createForGarden).toHaveBeenCalledWith('user-a', 3, dto);
  });

  it('delegates updates and deletion through the owner and bed id', async () => {
    const dto = { name: 'Updated bed' };

    await controller.update('user-a', 7, dto);
    await controller.remove('user-a', 7);

    expect(service.update).toHaveBeenCalledWith('user-a', 7, dto);
    expect(service.remove).toHaveBeenCalledWith('user-a', 7);
  });
});
