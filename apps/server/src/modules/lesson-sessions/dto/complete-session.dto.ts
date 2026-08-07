import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SessionSentiment {
  WENT_WELL = 'went_well',
  OKAY = 'okay',
  TOUGH = 'tough',
}

export class CompleteSessionDto {
  @ApiPropertyOptional({ description: 'Final elapsed time in seconds', example: 2700 })
  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedSeconds?: number;

  @ApiPropertyOptional({ description: 'Completion timestamp (defaults to now)', example: '2026-08-05T10:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Teacher reflection notes after the lesson',
    example: 'Students responded well to the hands-on circuit building. Need more time for the coding portion next session.',
  })
  @IsOptional()
  @IsString()
  reflection?: string;

  @ApiPropertyOptional({
    description: 'Teacher sentiment about how the lesson went',
    enum: SessionSentiment,
    example: SessionSentiment.WENT_WELL,
  })
  @IsOptional()
  @IsIn([SessionSentiment.WENT_WELL, SessionSentiment.OKAY, SessionSentiment.TOUGH])
  sentiment?: SessionSentiment;
}
