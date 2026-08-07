import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AssessmentItemDto {
  @ApiProperty({ description: 'Learner UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  learnerId: string;

  @ApiProperty({ description: 'Assessment score (1=Emerging, 2=Developing, 3-4=Secure)', example: 3 })
  @IsInt()
  @Min(1)
  @Max(4)
  score: number;
}

export class CreateAssessmentBulkDto {
  @ApiProperty({ description: 'Lesson UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  lessonId: string;

  @ApiProperty({ description: 'Lesson session UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  lessonSessionId: string;

  @ApiProperty({ description: 'Assessment items for each learner', type: [AssessmentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentItemDto)
  assessments: AssessmentItemDto[];
}
