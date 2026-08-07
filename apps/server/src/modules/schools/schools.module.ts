import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { School } from '../../database/entities/school.entity';
import { User } from '../../database/entities/user.entity';
import { Class } from '../../database/entities/class.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Evidence } from '../../database/entities/evidence.entity';
import { MediaLibrary } from '../../database/entities/media-library.entity';
import { Project } from '../../database/entities/project.entity';
import { CurriculumVersion } from '../../database/entities/curriculum-version.entity';
import { Unit } from '../../database/entities/unit.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      School,
      User,
      Class,
      LessonSession,
      Attendance,
      Evidence,
      MediaLibrary,
      Project,
      CurriculumVersion,
      Unit,
      Lesson,
    ]),
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
