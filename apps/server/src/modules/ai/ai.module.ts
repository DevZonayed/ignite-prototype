import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiMessage } from '../../database/entities/ai-message.entity';
import { AiConfig } from '../../database/entities/ai-config.entity';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClaudeService } from './claude.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiMessage, AiConfig])],
  controllers: [AiController],
  providers: [AiService, ClaudeService],
  exports: [AiService, ClaudeService],
})
export class AiModule {}
