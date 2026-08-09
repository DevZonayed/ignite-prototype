import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../database/entities/user.entity';
import { Class } from '../../database/entities/class.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { ParentChild } from '../../database/entities/parent-child.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Project } from '../../database/entities/project.entity';
import { ProgressReport } from '../../database/entities/progress-report.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { Certificate } from '../../database/entities/certificate.entity';
import { Evidence } from '../../database/entities/evidence.entity';
import { HomeworkSubmission } from '../../database/entities/homework-submission.entity';
import { Homework } from '../../database/entities/homework.entity';
import { Notification } from '../../database/entities/notification.entity';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Class,
      LessonSession,
      ParentChild,
      Attendance,
      Project,
      ProgressReport,
      LqsScore,
      LqsDimension,
      Certificate,
      Evidence,
      HomeworkSubmission,
      Homework,
      Notification,
    ]),
  ],
  controllers: [UsersController, ChildrenController],
  providers: [UsersService, ChildrenService],
  exports: [UsersService, ChildrenService],
})
export class UsersModule {}
