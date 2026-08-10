import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum AnnouncementAudience {
  ALL_PARENTS = 'all_parents',
  BY_SCHOOL = 'by_school',
  BY_CLASS = 'by_class',
}

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Title of the announcement',
    example: 'End-of-term report cards available',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Body message of the announcement',
    example:
      'Dear parents, the Term 2 report cards are now available on the portal.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Target audience for the announcement',
    enum: AnnouncementAudience,
    example: AnnouncementAudience.ALL_PARENTS,
  })
  @IsEnum(AnnouncementAudience)
  @IsNotEmpty()
  audience: AnnouncementAudience;

  @ApiPropertyOptional({
    description:
      'School ID, required when audience is "by_school"',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({
    description:
      'Class ID, required when audience is "by_class"',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({
    description: 'IDs of media files to attach to the announcement',
    example: [
      'c3d4e5f6-a1b2-7890-abcd-ef1234567890',
      'd4e5f6a7-b2c3-8901-bcde-f12345678901',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  attachedMediaIds?: string[];
}
