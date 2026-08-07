import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { SyncStatus } from '../../../database/entities/lesson-session.entity';

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: 'Total paused duration in seconds', example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  pausedDurationSeconds?: number;

  @ApiPropertyOptional({ description: 'Total elapsed time in seconds', example: 1800 })
  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedSeconds?: number;

  @ApiPropertyOptional({ description: 'Sync status of the session', enum: SyncStatus, example: SyncStatus.SYNCED })
  @IsOptional()
  @IsEnum(SyncStatus)
  syncStatus?: SyncStatus;
}
