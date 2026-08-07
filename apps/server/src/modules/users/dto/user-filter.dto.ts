import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UserFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: ['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent'],
  })
  @IsOptional()
  @IsEnum(['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent'])
  role?: string;

  @ApiPropertyOptional({ description: 'Filter by school ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({
    description: 'Filter by account status',
    enum: ['invited', 'active', 'suspended', 'deactivated'],
  })
  @IsOptional()
  @IsEnum(['invited', 'active', 'suspended', 'deactivated'])
  status?: string;

  @ApiPropertyOptional({ description: 'Search by name or email', example: 'jane' })
  @IsOptional()
  @IsString()
  search?: string;

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
