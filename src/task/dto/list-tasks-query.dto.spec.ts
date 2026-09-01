import { validate } from 'class-validator';
import { TaskStatus } from '../task.types';
import { ListTasksQueryDto } from './list-tasks-query.dto';

describe('ListTasksQueryDto', () => {
  it('accepts supported task filters', async () => {
    const query = Object.assign(new ListTasksQueryDto(), {
      dueOn: '2026-09-01',
      status: TaskStatus.OPEN,
    });

    await expect(validate(query)).resolves.toHaveLength(0);
  });

  it.each(['01-09-2026', '2026-02-30', '2026-09-01T12:00:00Z'])(
    'rejects invalid dueOn value %s',
    async (dueOn) => {
      const query = Object.assign(new ListTasksQueryDto(), { dueOn });

      expect(await validate(query)).not.toHaveLength(0);
    },
  );

  it('rejects an unsupported status', async () => {
    const query = Object.assign(new ListTasksQueryDto(), {
      status: 'IN_PROGRESS',
    });

    expect(await validate(query)).not.toHaveLength(0);
  });
});
