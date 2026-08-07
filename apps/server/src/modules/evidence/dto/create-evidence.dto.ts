import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { EvidenceMediaType } from '../../../database/entities/evidence.entity';

export class CreateEvidenceDto {
  @ApiProperty({
    description: 'ID of the lesson this evidence belongs to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    description: 'ID of the class this evidence belongs to',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321',
  })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
    description: 'Type of media captured',
    enum: EvidenceMediaType,
    example: EvidenceMediaType.PHOTO,
  })
  @IsEnum(EvidenceMediaType)
  @IsNotEmpty()
  mediaType: EvidenceMediaType;

  @ApiProperty({
    description: 'URL of the uploaded file',
    example: 'https://storage.example.com/evidence/photo-123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'Whether parental consent has been checked for this capture',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  consentChecked: boolean;

  @ApiPropertyOptional({
    description: 'IDs of learners to tag in this evidence',
    example: [
      'c3d4e5f6-a1b2-7890-abcd-ef1234567890',
      'd4e5f6a7-b2c3-8901-bcde-f12345678901',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  learnerIds?: string[];
}
