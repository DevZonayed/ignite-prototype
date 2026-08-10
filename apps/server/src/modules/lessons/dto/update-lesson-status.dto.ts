import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { LessonStatus } from '../../../database/entities/lesson.entity';

/**
 * Status-only update.
 *
 * This used to be a bare `@Body('status')` string, which meant an unknown value
 * such as "published" reached the database untouched and came back as a 500.
 * Validating it here turns a client mistake back into the 400 it always was.
 */
export class UpdateLessonStatusDto {
  @ApiProperty({ description: 'Lesson status', enum: LessonStatus })
  @IsNotEmpty()
  @IsEnum(LessonStatus)
  status: LessonStatus;
}
