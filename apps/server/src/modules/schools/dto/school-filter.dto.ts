import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { SchoolRegion, SchoolStatus } from '../../../database/entities/school.entity';

export class SchoolFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by region',
    enum: SchoolRegion,
  })
  @IsOptional()
  @IsEnum(SchoolRegion)
  region?: SchoolRegion;

  @ApiPropertyOptional({
    description: 'Filter by school status',
    enum: SchoolStatus,
  })
  @IsOptional()
  @IsEnum(SchoolStatus)
  status?: SchoolStatus;

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
