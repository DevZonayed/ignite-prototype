import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SchoolReportFilterDto {
  @ApiPropertyOptional({ description: 'Filter by school ID' })
  @IsUUID()
  @IsOptional()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'Filter by academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({
    description: 'Filter by report type',
    enum: ['coverage_summary', 'attendance_register', 'project_completion', 'teacher_activity'],
  })
  @IsEnum(['coverage_summary', 'attendance_register', 'project_completion', 'teacher_activity'])
  @IsOptional()
  type?: string;

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
