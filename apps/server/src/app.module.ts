import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { getDatabaseConfig } from './config/database.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { ClassesModule } from './modules/classes/classes.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { LessonSessionsModule } from './modules/lesson-sessions/lesson-sessions.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { LqsModule } from './modules/lqs/lqs.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { SyncModule } from './modules/sync/sync.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { AuditModule } from './modules/audit/audit.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { ImportsModule } from './modules/imports/imports.module';
import { SeedModule } from './database/seeds/seed.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    SchoolsModule,
    ClassesModule,
    CurriculumModule,
    LessonsModule,
    LessonSessionsModule,
    AttendanceModule,
    HomeworkModule,
    EvidenceModule,
    AssessmentModule,
    LqsModule,
    PortfolioModule,
    ReportsModule,
    AiModule,
    AnnouncementsModule,
    SyncModule,
    NotificationsModule,
    MediaModule,
    AuditModule,
    MonitoringModule,
    ImportsModule,
    SeedModule,
  ],
  providers: [
    // Global JWT authentication guard — all routes require auth by default.
    // Use @Public() decorator to opt out individual routes.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard — enforces @Roles() decorator when present.
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
