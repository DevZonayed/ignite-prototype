import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonSession } from '../../database/entities/lesson-session.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { LessonSessionsService } from './lesson-sessions.service';
import { LessonSessionsController } from './lesson-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LessonSession, Lesson, Attendance])],
  controllers: [LessonSessionsController],
  providers: [LessonSessionsService],
  exports: [LessonSessionsService],
})
export class LessonSessionsModule {}
