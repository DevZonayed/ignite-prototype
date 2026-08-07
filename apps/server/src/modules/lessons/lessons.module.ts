import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lesson } from '../../database/entities/lesson.entity';
import { LessonMedia } from '../../database/entities/lesson-media.entity';
import { LessonStep } from '../../database/entities/lesson-step.entity';
import { LessonActivity } from '../../database/entities/lesson-activity.entity';
import { Unit } from '../../database/entities/unit.entity';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, LessonMedia, LessonStep, LessonActivity, Unit]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
