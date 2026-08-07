import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { SchoolRegion } from '../../../database/entities/school.entity';

export class CreateSchoolDto {
  @ApiProperty({ description: 'School name', example: 'Lagos STEM Academy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Region where the school is located',
    enum: SchoolRegion,
    example: SchoolRegion.LAGOS,
  })
  @IsEnum(SchoolRegion)
  @IsNotEmpty()
  region: SchoolRegion;

  @ApiPropertyOptional({
    description: 'Curriculum version ID to assign',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  curriculumVersionId?: string;

  @ApiPropertyOptional({ description: 'School timezone', example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Academic year', example: '2025/2026' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Current term', example: 'Term 1' })
  @IsOptional()
  @IsString()
  currentTerm?: string;

  @ApiPropertyOptional({ description: 'Subject focus', example: 'STEM' })
  @IsOptional()
  @IsString()
  subject?: string;
}
