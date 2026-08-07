import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Class } from '../../database/entities/class.entity';
import { User } from '../../database/entities/user.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { School } from '../../database/entities/school.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Class, User, Attendance, School])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
