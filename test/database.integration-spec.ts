import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AuthenticatedRequest } from '../src/auth/auth.types';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { PrismaService } from '../src/prisma/prisma.service';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(),
}));

interface CreatedGarden {
  id: number;
  name: string;
  ownerId: string;
}

interface CreatedBed {
  id: number;
  gardenId: number;
}

interface CreatedTask {
  id: number;
  bedId: number;
  dueOn: string;
  recurrence: string;
}

describe('Garden Planner database integration', () => {
  const userA = 'auth0|integration-user-a';
  const userB = 'auth0|integration-user-b';
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testAuthGuard: CanActivate = {
      canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const userId = req.headers['x-test-user-id'];

        if (typeof userId !== 'string') {
          return false;
        }

        req.user = { sub: userId };
        return true;
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtStrategy)
      .useValue({})
      .overrideGuard(AuthGuard('jwt'))
      .useValue(testAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.bed.deleteMany();
    await prisma.garden.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.bed.deleteMany();
    await prisma.garden.deleteMany();
    await app.close();
    await prisma.$disconnect();
  });

  it('persists date-only tasks and isolates data by authenticated owner', async () => {
    const gardenAResponse = await request(app.getHttpServer())
      .post('/gardens')
      .set('x-test-user-id', userA)
      .send({ name: 'Back garden', region: 'PERTH' })
      .expect(201);
    const gardenA = gardenAResponse.body as CreatedGarden;

    const gardenBResponse = await request(app.getHttpServer())
      .post('/gardens')
      .set('x-test-user-id', userB)
      .send({ name: 'Other garden', region: 'PEEL' })
      .expect(201);
    const gardenB = gardenBResponse.body as CreatedGarden;

    const gardensResponse = await request(app.getHttpServer())
      .get('/gardens')
      .set('x-test-user-id', userA)
      .expect(200);
    const gardens = gardensResponse.body as CreatedGarden[];

    expect(gardens).toEqual([
      expect.objectContaining({ id: gardenA.id, ownerId: userA }),
    ]);

    expect(gardenB.ownerId).toBe(userB);

    const bedResponse = await request(app.getHttpServer())
      .post(`/gardens/${gardenA.id}/beds`)
      .set('x-test-user-id', userA)
      .send({ name: 'Vegetables', positionIndex: 0 })
      .expect(201);
    const bed = bedResponse.body as CreatedBed;

    await request(app.getHttpServer())
      .post(`/gardens/${gardenA.id}/beds`)
      .set('x-test-user-id', userB)
      .send({ name: 'Intruding bed', positionIndex: 1 })
      .expect(404);

    const taskResponse = await request(app.getHttpServer())
      .post(`/beds/${bed.id}/tasks`)
      .set('x-test-user-id', userA)
      .send({
        title: 'Water seedlings',
        dueOn: '2026-09-01',
        recurrence: 'WEEKLY',
      })
      .expect(201);
    const task = taskResponse.body as CreatedTask;

    expect(task).toMatchObject({
      bedId: bed.id,
      dueOn: '2026-09-01T00:00:00.000Z',
      recurrence: 'WEEKLY',
    });

    const tasksResponse = await request(app.getHttpServer())
      .get(`/beds/${bed.id}/tasks?dueOn=2026-09-01&status=OPEN`)
      .set('x-test-user-id', userA)
      .expect(200);
    const tasks = tasksResponse.body as CreatedTask[];

    expect(tasks).toEqual([expect.objectContaining({ id: task.id })]);

    await request(app.getHttpServer())
      .get(`/beds/${bed.id}/tasks`)
      .set('x-test-user-id', userB)
      .expect(200)
      .expect([]);
  });

  it('enforces unique bed positions through the database constraint', async () => {
    const gardenResponse = await request(app.getHttpServer())
      .post('/gardens')
      .set('x-test-user-id', userA)
      .send({ name: 'Back garden', region: 'PERTH' })
      .expect(201);
    const garden = gardenResponse.body as CreatedGarden;

    await request(app.getHttpServer())
      .post(`/gardens/${garden.id}/beds`)
      .set('x-test-user-id', userA)
      .send({ name: 'Vegetables', positionIndex: 0 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/gardens/${garden.id}/beds`)
      .set('x-test-user-id', userA)
      .send({ name: 'Herbs', positionIndex: 0 })
      .expect(400);

    await expect(
      prisma.bed.count({ where: { gardenId: garden.id } }),
    ).resolves.toBe(1);
  });

  it('cascades garden deletion to its beds and tasks', async () => {
    const garden = await prisma.garden.create({
      data: { ownerId: userA, name: 'Back garden', region: 'PERTH' },
    });
    const bed = await prisma.bed.create({
      data: { gardenId: garden.id, name: 'Vegetables', positionIndex: 0 },
    });
    await prisma.task.create({
      data: { bedId: bed.id, title: 'Water seedlings' },
    });

    await request(app.getHttpServer())
      .delete(`/gardens/${garden.id}`)
      .set('x-test-user-id', userA)
      .expect(200);

    await expect(
      prisma.bed.count({ where: { gardenId: garden.id } }),
    ).resolves.toBe(0);
    await expect(prisma.task.count({ where: { bedId: bed.id } })).resolves.toBe(
      0,
    );
  });
});
