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

describe('Garden Planner API (e2e)', () => {
  let app: INestApplication<App>;
  let taskFindMany: jest.Mock;

  beforeAll(async () => {
    taskFindMany = jest.fn().mockResolvedValue([]);
    const testAuthGuard: CanActivate = {
      canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
        req.user = {
          sub: 'auth0|user-a',
          aud: 'garden-planner-api',
          iss: 'https://example.auth0.com/',
        };
        return true;
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtStrategy)
      .useValue({})
      .overrideProvider(PrismaService)
      .useValue({ task: { findMany: taskFindMany } })
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns claims supplied by the authenticated request', async () => {
    await request(app.getHttpServer()).get('/profile').expect(200).expect({
      sub: 'auth0|user-a',
      aud: 'garden-planner-api',
      iss: 'https://example.auth0.com/',
    });
  });

  it('applies authenticated ownership and validated filters over HTTP', async () => {
    await request(app.getHttpServer())
      .get('/beds/7/tasks?dueOn=2026-09-01&status=OPEN')
      .expect(200)
      .expect([]);

    expect(taskFindMany).toHaveBeenCalledWith({
      where: {
        bedId: 7,
        bed: { garden: { ownerId: 'auth0|user-a' } },
        dueOn: new Date('2026-09-01T00:00:00.000Z'),
        status: 'OPEN',
      },
    });
  });

  it('rejects invalid task filters before reaching the service', async () => {
    taskFindMany.mockClear();

    await request(app.getHttpServer())
      .get('/beds/7/tasks?dueOn=2026-02-30')
      .expect(400);

    expect(taskFindMany).not.toHaveBeenCalled();
  });
});
