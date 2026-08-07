import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreEntryDto {
  @ApiProperty({ description: 'LQS dimension UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  dimensionId: string;

  @ApiProperty({ description: 'Score value (1-4)', example: 3 })
  @IsInt()
  @Min(1)
  @Max(4)
  score: number;
}

export class SaveScoreDto {
  @ApiProperty({ description: 'Learner UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  learnerId: string;

  @ApiPropertyOptional({ description: 'Lesson UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiProperty({ description: 'Array of dimension scores', type: [ScoreEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreEntryDto)
  scores: ScoreEntryDto[];
}
