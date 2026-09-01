import { Region } from '@prisma/client';
import { GardenController } from './garden.controller';
import { GardenService } from './garden.service';

describe('GardenController', () => {
  let controller: GardenController;
  let service: {
    listForOwner: jest.Mock;
    createForOwner: jest.Mock;
    getOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    service = {
      listForOwner: jest.fn(),
      createForOwner: jest.fn(),
      getOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new GardenController(service as unknown as GardenService);
  });

  it('delegates listing to the authenticated owner', async () => {
    await controller.list('user-a');

    expect(service.listForOwner).toHaveBeenCalledWith('user-a');
  });

  it('delegates creation with the authenticated owner', async () => {
    const dto = { name: 'Backyard', region: Region.PERTH };

    await controller.create('user-a', dto);

    expect(service.createForOwner).toHaveBeenCalledWith('user-a', dto);
  });

  it('delegates reading, updating, and deleting by owner and garden id', async () => {
    const dto = { name: 'Updated garden' };

    await controller.getOne('user-a', 3);
    await controller.update('user-a', 3, dto);
    await controller.remove('user-a', 3);

    expect(service.getOne).toHaveBeenCalledWith('user-a', 3);
    expect(service.update).toHaveBeenCalledWith('user-a', 3, dto);
    expect(service.remove).toHaveBeenCalledWith('user-a', 3);
  });
});
