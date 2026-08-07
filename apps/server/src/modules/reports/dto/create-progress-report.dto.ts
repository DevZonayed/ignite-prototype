import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProgressReportDto {
  @ApiProperty({ description: 'Child/Learner ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  childId: string;

  @ApiPropertyOptional({ description: 'Academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({ description: 'Programme name', example: 'Junior Coders' })
  @IsString()
  @IsOptional()
  programme?: string;
}
