import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Evidence } from '../../database/entities/evidence.entity';
import { EvidenceTag } from '../../database/entities/evidence-tag.entity';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';

@Module({
  imports: [TypeOrmModule.forFeature([Evidence, EvidenceTag])],
  controllers: [EvidenceController],
  providers: [EvidenceService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
