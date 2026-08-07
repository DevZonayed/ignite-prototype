import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project title', example: 'My Scratch Game' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'File type',
    enum: ['scratch', 'python', 'robotics', 'design', 'video'],
  })
  @IsEnum(['scratch', 'python', 'robotics', 'design', 'video'])
  fileType: string;

  @ApiPropertyOptional({ description: 'File name', example: 'game.sb3' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'File URL',
    example: 'https://storage.example.com/projects/game.sb3',
  })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Code snippet' })
  @IsString()
  @IsOptional()
  codeSnippet?: string;

  @ApiPropertyOptional({ description: 'Project description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Skills demonstrated (comma-separated or text)' })
  @IsString()
  @IsOptional()
  skills?: string;

  @ApiPropertyOptional({ description: 'Academic term', example: 'Term 1' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({ description: 'Linked lesson ID' })
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ description: 'Learner ID' })
  @IsUUID()
  learnerId: string;
}
