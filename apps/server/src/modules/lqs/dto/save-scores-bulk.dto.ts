import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScoreEntryDto } from './save-score.dto';

export class BulkScoreEntryDto {
  @ApiProperty({ description: 'Learner UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  learnerId: string;

  @ApiProperty({ description: 'Array of dimension scores', type: [ScoreEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreEntryDto)
  scores: ScoreEntryDto[];
}

export class SaveScoresBulkDto {
  @ApiPropertyOptional({ description: 'Lesson UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiProperty({ description: 'Array of per-learner score entries', type: [BulkScoreEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkScoreEntryDto)
  entries: BulkScoreEntryDto[];
}
