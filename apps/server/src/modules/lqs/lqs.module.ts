import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { Badge } from '../../database/entities/badge.entity';
import { BadgeAward } from '../../database/entities/badge-award.entity';
import { Certificate } from '../../database/entities/certificate.entity';
import { User } from '../../database/entities/user.entity';
import { School } from '../../database/entities/school.entity';
import { LqsService } from './lqs.service';
import { LqsController } from './lqs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LqsDimension,
      LqsScore,
      Badge,
      BadgeAward,
      Certificate,
      User,
      School,
    ]),
  ],
  controllers: [LqsController],
  providers: [LqsService],
  exports: [LqsService],
})
export class LqsModule {}
