import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProgressReport } from '../../database/entities/progress-report.entity';
import { SchoolReport } from '../../database/entities/school-report.entity';
import { Class } from '../../database/entities/class.entity';
import { School } from '../../database/entities/school.entity';
import { User } from '../../database/entities/user.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Project } from '../../database/entities/project.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgressReport,
      SchoolReport,
      School,
      Class,
      User,
      LessonSession,
      Attendance,
      Project,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
