import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class HeatmapQueryDto {
  @ApiProperty({ description: 'School UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsNotEmpty()
  @IsUUID()
  schoolId: string;

  @ApiPropertyOptional({ description: 'Term to filter by', example: 'Term 1' })
  @IsOptional()
  @IsString()
  term?: string;
}
