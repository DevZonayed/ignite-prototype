import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export enum SchoolReportType {
  COVERAGE_SUMMARY = 'coverage_summary',
  ATTENDANCE_REGISTER = 'attendance_register',
  PROJECT_COMPLETION = 'project_completion',
  TEACHER_ACTIVITY = 'teacher_activity',
}

export class CreateSchoolReportDto {
  @ApiProperty({ description: 'School ID' })
  @IsUUID()
  schoolId: string;

  @ApiProperty({
    description: 'Report type',
    enum: SchoolReportType,
    example: SchoolReportType.COVERAGE_SUMMARY,
  })
  @IsIn([
    SchoolReportType.COVERAGE_SUMMARY,
    SchoolReportType.ATTENDANCE_REGISTER,
    SchoolReportType.PROJECT_COMPLETION,
    SchoolReportType.TEACHER_ACTIVITY,
  ])
  type: SchoolReportType;

  @ApiPropertyOptional({ description: 'Academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;
}
