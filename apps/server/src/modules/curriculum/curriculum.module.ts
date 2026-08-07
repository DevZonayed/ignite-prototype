import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurriculumVersion } from '../../database/entities/curriculum-version.entity';
import { Unit } from '../../database/entities/unit.entity';
import { School } from '../../database/entities/school.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { Class } from '../../database/entities/class.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurriculumVersion, Unit, School, Lesson, Class, LessonSession]),
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
  exports: [CurriculumService],
})
export class CurriculumModule {}
