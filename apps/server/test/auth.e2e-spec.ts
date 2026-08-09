import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { SeedService } from '../src/database/seeds/seed.service';

/**
 * The real application, over real HTTP, against an in-process sql.js database.
 *
 * Nothing is mocked: this is the same wiring `main.ts` sets up, so it catches
 * the things unit tests cannot — a guard that does not fire, a validation pipe
 * that strips a field, a route that moved.
 */
describe('Auth and authorisation (e2e)', () => {
  let app: INestApplication;
  let teacherToken: string;
  let parentToken: string;

  beforeAll(async () => {
    // sql.js with no file: a fresh schema per run, nothing left on disk.
    process.env.DB_TYPE = 'sqlite';
    process.env.DB_SQLITE_PATH = '';
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.SEED_DEFAULT_PASSWORD = 'ignite123';
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // Mirror main.ts exactly — testing a differently-configured app would prove
    // nothing about the one that ships.
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    await app.get(SeedService).seed();
  }, 120000);

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('health', () => {
    it('is public and reports the database', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/monitoring/health')
        .expect(200);

      expect(res.body.data).toMatchObject({ status: 'ok', database: true });
    });
  });

  describe('sign in', () => {
    it('issues a token to a teacher', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          identifier: 'funke.okafor@ignite.edu.ng',
          password: 'ignite123',
          role: 'teacher',
        })
        .expect(201);

      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.user.role).toBe('teacher');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      teacherToken = res.body.data.accessToken;
    });

    it('issues a token to a parent', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          identifier: 'tunde.eze@parent.ignite.edu.ng',
          password: 'ignite123',
          role: 'parent',
        })
        .expect(201);

      parentToken = res.body.data.accessToken;
      expect(parentToken).toEqual(expect.any(String));
    });

    it('rejects a wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          identifier: 'funke.okafor@ignite.edu.ng',
          password: 'not-the-password',
          role: 'teacher',
        })
        .expect(401);
    });

    it('rejects a teacher signing in as a parent', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          identifier: 'funke.okafor@ignite.edu.ng',
          password: 'ignite123',
          role: 'parent',
        })
        .expect(401);
    });

    it('rejects a request with fields the DTO does not declare', async () => {
      // forbidNonWhitelisted is what stops an unexpected field from reaching a
      // service. If the pipe is ever dropped this test fails loudly.
      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          identifier: 'funke.okafor@ignite.edu.ng',
          password: 'ignite123',
          role: 'teacher',
          isAdmin: true,
        })
        .expect(400);
    });
  });

  describe('authorisation', () => {
    it('refuses an unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/api/classes').expect(401);
    });

    it('refuses a garbage token', async () => {
      await request(app.getHttpServer())
        .get('/api/classes')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('allows a teacher to read their classes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      const rows = res.body.data?.data ?? res.body.data;
      expect(Array.isArray(rows)).toBe(true);
    });

    it('refuses a teacher on a platform-admin route', async () => {
      // RolesGuard, not just JwtAuthGuard: a valid token is not authority.
      await request(app.getHttpServer())
        .get('/api/monitoring/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('refuses a teacher on a parent-only route', async () => {
      await request(app.getHttpServer())
        .get('/api/parents/me/children')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('allows a parent to list their children', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/parents/me/children')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      const rows = res.body.data?.data ?? res.body.data;
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('response envelope', () => {
    it('wraps success as { data, meta }', async () => {
      // Every app's client unwraps this shape; changing it breaks all five.
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.meta).toMatchObject({
        path: '/api/auth/me',
        statusCode: 200,
      });
    });

    it('reports validation failures as a message array', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ identifier: '', password: '' })
        .expect(400);

      expect(Array.isArray(res.body.message)).toBe(true);
    });
  });

  describe('invite lookup', () => {
    it('404s an unknown code rather than confirming it exists', async () => {
      await request(app.getHttpServer()).get('/api/auth/invite/NOTAREALCODE').expect(404);
    });
  });
});
