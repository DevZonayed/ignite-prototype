import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EvidenceFilterDto {
  @ApiPropertyOptional({ description: 'Filter by lesson ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Filter by class ID', example: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Filter by teacher ID', example: 'c3d4e5f6-a1b2-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of results per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
