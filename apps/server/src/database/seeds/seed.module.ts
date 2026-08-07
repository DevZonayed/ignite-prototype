import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

import {
  User,
  School,
  Class,
  CurriculumVersion,
  Unit,
  Lesson,
  LessonMedia,
  LessonActivity,
  LqsDimension,
  LqsScore,
  Badge,
  BadgeAward,
  Certificate,
  Project,
  ParentChild,
  Homework,
  HomeworkSubmission,
  HomeworkMessage,
  ProgressReport,
  AiConfig,
  AuditLog,
  Announcement,
} from '../../database/entities/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      School,
      Class,
      CurriculumVersion,
      Unit,
      Lesson,
      LessonMedia,
      LessonActivity,
      LqsDimension,
      LqsScore,
      Badge,
      BadgeAward,
      Certificate,
      Project,
      ParentChild,
      Homework,
      HomeworkSubmission,
      HomeworkMessage,
      ProgressReport,
      AiConfig,
      AuditLog,
      Announcement,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
