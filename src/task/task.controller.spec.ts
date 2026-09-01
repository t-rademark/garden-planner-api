import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskStatus } from './task.types';

describe('TaskController', () => {
  let controller: TaskController;
  let service: {
    listForBed: jest.Mock;
    listDueTodayForGarden: jest.Mock;
    getGardenWalk: jest.Mock;
    createForBed: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    service = {
      listForBed: jest.fn(),
      listDueTodayForGarden: jest.fn(),
      getGardenWalk: jest.fn(),
      createForBed: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new TaskController(service as unknown as TaskService);
  });

  it('delegates filtered bed task listings with ownership context', async () => {
    const query = { dueOn: '2026-09-01', status: TaskStatus.OPEN };

    await controller.listForBed('user-a', 7, query);

    expect(service.listForBed).toHaveBeenCalledWith('user-a', 7, query);
  });

  it('delegates due-today and garden-walk requests', async () => {
    await controller.dueTodayForGarden('user-a', 3);
    await controller.getGardenWalk('user-a', 3);

    expect(service.listDueTodayForGarden).toHaveBeenCalledWith('user-a', 3);
    expect(service.getGardenWalk).toHaveBeenCalledWith('user-a', 3);
  });

  it('delegates task creation, updates, and deletion with ownership context', async () => {
    const createDto = { title: 'Water seedlings' };
    const updateDto = { status: TaskStatus.DONE };

    await controller.createForBed('user-a', 7, createDto);
    await controller.update('user-a', 11, updateDto);
    await controller.remove('user-a', 11);

    expect(service.createForBed).toHaveBeenCalledWith('user-a', 7, createDto);
    expect(service.update).toHaveBeenCalledWith('user-a', 11, updateDto);
    expect(service.remove).toHaveBeenCalledWith('user-a', 11);
  });
});
