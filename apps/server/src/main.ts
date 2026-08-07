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

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
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
      'IGNITE Platform Backend API — coding, robotics & STEAM education',
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

  // Seed database on first run
  const seedService = app.get(SeedService);
  await seedService.seed();

  // Start
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`IGNITE API running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
