import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { MediaType } from '../../../database/entities/lesson-media.entity';

export class UploadMediaDto {
  @ApiProperty({
    description: 'Display name for the media item',
    example: 'Introduction to Scratch',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Media file type',
    enum: MediaType,
    example: MediaType.MP4,
  })
  @IsEnum(MediaType)
  @IsNotEmpty()
  type: MediaType;

  @ApiProperty({
    description: 'Original file name including extension',
    example: 'intro-to-scratch.mp4',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Unit ID to associate the media with',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  unitId?: string;
}
