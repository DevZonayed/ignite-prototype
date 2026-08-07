import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { MediaType } from '../../../database/entities/lesson-media.entity';

export class CreateLessonMediaDto {
  @ApiProperty({
    description: 'Media file type',
    enum: MediaType,
    example: MediaType.MP4,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ description: 'Media title', example: 'Lesson intro video' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Original file name', example: 'intro.mp4' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'Duration (for video/audio)', example: '5:30' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Media category', example: 'video' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
