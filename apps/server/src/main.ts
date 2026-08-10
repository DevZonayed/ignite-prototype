import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SeedService } from './database/seeds/seed.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS. CORS_ORIGIN is a comma-separated list, and it has to be split into an
  // array: handing the raw string to `origin` echoes it back verbatim, and
  // `Access-Control-Allow-Origin: a,b` is not a valid header — the browser
  // compares it to the request's origin as a whole and rejects every request.
  // With an array, the cors package matches and echoes the single caller.
  const corsOrigin = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigin.length > 0 ? corsOrigin : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('IGNITE API')
    .setDescription(
      'IGNITE Platform Backend API for coding, robotics and STEAM education',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('auth', 'Authentication & authorization')
    .addTag('users', 'User management')
    .addTag('schools', 'School management')
    .addTag('classes', 'Class management')
    .addTag('curriculum', 'Curriculum & modules')
    .addTag('lessons', 'Lesson plans')
    .addTag('lesson-sessions', 'Live lesson sessions')
    .addTag('attendance', 'Attendance tracking')
    .addTag('homework', 'Homework assignments')
    .addTag('evidence', 'Learning evidence capture')
    .addTag('assessment', 'Assessment & grading')
    .addTag('lqs', 'Learner Quality Signals')
    .addTag('portfolio', 'Learner portfolios')
    .addTag('reports', 'Reports & analytics')
    .addTag('ai', 'AI-powered features')
    .addTag('announcements', 'Announcements')
    .addTag('sync', 'Offline sync')
    .addTag('notifications', 'Push notifications')
    .addTag('media', 'Media & file uploads')
    .addTag('audit', 'Audit logging')
    .addTag('monitoring', 'Health & monitoring')
    .addTag('imports', 'Bulk data imports')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Seed demo content on first run. Set SEED_DEMO_DATA=false for a real
  // deployment — the database then starts empty and the admin portal shows its
  // first-run screen to create the initial platform administrator.
  if (process.env.SEED_DEMO_DATA !== 'false') {
    const seedService = app.get(SeedService);
    await seedService.seed();
  } else {
    logger.log('SEED_DEMO_DATA=false, skipping demo seed');
  }

  // Start
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`IGNITE API running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
