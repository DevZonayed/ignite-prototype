import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { LessonStatus } from '../../../database/entities/lesson.entity';
import { CreateLessonDto } from './create-lesson.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @ApiPropertyOptional({
    description: 'Lesson status',
    enum: LessonStatus,
    example: LessonStatus.CURRENT,
  })
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;
}
