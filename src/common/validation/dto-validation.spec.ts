import { Region } from '@prisma/client';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CreateBedDto } from '../../bed/dto/create-bed.dto';
import { UpdateBedDto } from '../../bed/dto/update-bed.dto';
import { CreateGardenDto } from '../../garden/dto/create-garden.dto';
import { UpdateGardenDto } from '../../garden/dto/update-garden.dto';
import { CreateTaskDto } from '../../task/dto/create-task.dto';
import { ListTasksQueryDto } from '../../task/dto/list-tasks-query.dto';
import { UpdateTaskDto } from '../../task/dto/update-task.dto';

async function validatePlain<T extends object>(
  type: ClassConstructor<T>,
  value: object,
): Promise<{ dto: T; errors: ValidationError[] }> {
  const dto = plainToInstance(type, value);
  return { dto, errors: await validate(dto) };
}

describe('DTO validation', () => {
  it('trims garden, bed, task, and notes text before validation', async () => {
    const garden = await validatePlain(CreateGardenDto, {
      name: '  Backyard  ',
      region: Region.PERTH,
    });
    const bed = await validatePlain(CreateBedDto, {
      name: '  Vegetables  ',
      positionIndex: 0,
      notes: '  Full sun  ',
    });
    const task = await validatePlain(CreateTaskDto, {
      title: '  Water seedlings  ',
    });

    expect(garden.errors).toHaveLength(0);
    expect(bed.errors).toHaveLength(0);
    expect(task.errors).toHaveLength(0);
    expect(garden.dto.name).toBe('Backyard');
    expect(bed.dto.name).toBe('Vegetables');
    expect(bed.dto.notes).toBe('Full sun');
    expect(task.dto.title).toBe('Water seedlings');
  });

  it.each([
    [CreateGardenDto, { name: '   ', region: Region.PERTH }, 'name'],
    [UpdateGardenDto, { name: '   ' }, 'name'],
    [CreateBedDto, { name: '   ', positionIndex: 0 }, 'name'],
    [UpdateBedDto, { notes: '   ' }, 'notes'],
    [CreateTaskDto, { title: '   ' }, 'title'],
    [UpdateTaskDto, { title: '   ' }, 'title'],
  ] as const)(
    'rejects whitespace-only %s.%s',
    async (type, value, property) => {
      const { errors } = await validatePlain(type, value);

      expect(errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ property })]),
      );
    },
  );

  it.each([CreateTaskDto, UpdateTaskDto, ListTasksQueryDto])(
    'rejects impossible calendar dates in %s',
    async (type) => {
      const { errors } = await validatePlain(type, { dueOn: '2026-02-30' });

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'dueOn' }),
        ]),
      );
    },
  );

  it('allows null only when clearing an existing task due date', async () => {
    const update = await validatePlain(UpdateTaskDto, { dueOn: null });
    const create = await validatePlain(CreateTaskDto, {
      title: 'Water seedlings',
      dueOn: null,
    });
    const query = await validatePlain(ListTasksQueryDto, { dueOn: null });

    expect(update.errors).toHaveLength(0);
    expect(update.dto.dueOn).toBeNull();
    expect(create.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'dueOn' })]),
    );
    expect(query.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'dueOn' })]),
    );
  });

  it('rejects null for other optional update fields', async () => {
    const task = await validatePlain(UpdateTaskDto, { title: null });
    const bed = await validatePlain(UpdateBedDto, { notes: null });
    const garden = await validatePlain(UpdateGardenDto, { region: null });

    expect(task.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'title' })]),
    );
    expect(bed.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'notes' })]),
    );
    expect(garden.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'region' })]),
    );
  });
});
