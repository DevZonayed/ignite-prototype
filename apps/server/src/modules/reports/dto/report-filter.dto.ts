import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFilterDto {
  @ApiPropertyOptional({ description: 'Filter by child/learner ID' })
  @IsUUID()
  @IsOptional()
  childId?: string;

  @ApiPropertyOptional({ description: 'Filter by academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: ['draft', 'published'],
  })
  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
