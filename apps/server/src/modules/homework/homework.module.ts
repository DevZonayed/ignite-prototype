import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Homework } from '../../database/entities/homework.entity';
import { HomeworkSubmission } from '../../database/entities/homework-submission.entity';
import { HomeworkMessage } from '../../database/entities/homework-message.entity';
import { ParentChild } from '../../database/entities/parent-child.entity';
import { Class } from '../../database/entities/class.entity';
import { User } from '../../database/entities/user.entity';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Homework,
      HomeworkSubmission,
      HomeworkMessage,
      ParentChild,
      Class,
      User,
    ]),
  ],
  controllers: [HomeworkController],
  providers: [HomeworkService],
  exports: [HomeworkService],
})
export class HomeworkModule {}
