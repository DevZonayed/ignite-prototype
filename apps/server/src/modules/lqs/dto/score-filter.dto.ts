import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ScoreFilterDto {
  @ApiPropertyOptional({ description: 'Filter by learner UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsOptional()
  learnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by dimension UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID()
  @IsOptional()
  dimensionId?: string;

  @ApiPropertyOptional({ description: 'Filter by academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({ description: 'Filter by lesson UUID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  @IsUUID()
  @IsOptional()
  lessonId?: string;
}
