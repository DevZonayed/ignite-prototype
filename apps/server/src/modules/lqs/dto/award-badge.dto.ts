import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AwardBadgeDto {
  @ApiProperty({ description: 'Badge UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  badgeId: string;

  @ApiProperty({ description: 'Learner UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID()
  learnerId: string;

  @ApiPropertyOptional({ description: 'Linked project UUID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  @IsUUID()
  @IsOptional()
  linkedProjectId?: string;
}
