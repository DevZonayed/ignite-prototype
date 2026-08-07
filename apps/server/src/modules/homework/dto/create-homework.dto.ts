import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { HomeworkStatus } from '../../../database/entities/homework.entity';

export class CreateHomeworkDto {
  @ApiProperty({ description: 'ID of the lesson this homework belongs to' })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ description: 'ID of the class this homework is assigned to' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Title of the homework', example: 'Chapter 3 Exercises' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Instructions or description for the homework' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Due date for the homework (ISO date)', example: '2026-09-15' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Homework status',
    enum: HomeworkStatus,
    default: HomeworkStatus.DRAFT,
  })
  @IsEnum(HomeworkStatus)
  @IsOptional()
  status?: HomeworkStatus;

  @ApiPropertyOptional({
    description: 'IDs of attached media items',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  attachedMediaIds?: string[];
}
