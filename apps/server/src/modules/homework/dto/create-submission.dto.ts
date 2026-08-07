import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'ID of the learner (child) submitting the homework' })
  @IsUUID()
  @IsNotEmpty()
  learnerId: string;

  @ApiPropertyOptional({ description: 'MIME type of the uploaded file', example: 'application/pdf' })
  @IsString()
  @IsOptional()
  fileType?: string;

  @ApiPropertyOptional({ description: 'URL of the uploaded file' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Original file name', example: 'homework-ch3.pdf' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in megabytes', example: 2.5 })
  @IsNumber()
  @IsOptional()
  fileSizeMb?: number;
}
