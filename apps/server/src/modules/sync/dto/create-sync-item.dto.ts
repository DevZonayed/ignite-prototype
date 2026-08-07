import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSyncItemDto {
  @ApiProperty({
    description: 'Type of entity to sync',
    example: 'lesson_session',
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: 'UUID of the entity to sync',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Size of the associated file in kilobytes',
    example: 512,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSizeKb?: number;

  @ApiPropertyOptional({
    description: 'Human-readable description of the sync item',
    example: 'Lesson session recording from Grade 4 Maths',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
