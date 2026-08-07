import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '../../database/entities/project.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { BadgeAward } from '../../database/entities/badge-award.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Attendance,
      BadgeAward,
      LqsScore,
      LqsDimension,
      Lesson,
      LessonSession,
    ]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
