import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PortfolioFilterDto {
  @ApiPropertyOptional({ description: 'Filter by learner ID' })
  @IsUUID()
  @IsOptional()
  learnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({
    description: 'Filter by file type',
    enum: ['scratch', 'python', 'robotics', 'design', 'video'],
  })
  @IsEnum(['scratch', 'python', 'robotics', 'design', 'video'])
  @IsOptional()
  fileType?: string;

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
