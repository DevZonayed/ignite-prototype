import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ description: 'Name of the class', example: 'Grade 5A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Grade level', example: 'Grade 5' })
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @ApiPropertyOptional({ description: 'Subject taught', example: 'Mathematics' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'School ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @ApiPropertyOptional({ description: 'Teacher ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;
}
