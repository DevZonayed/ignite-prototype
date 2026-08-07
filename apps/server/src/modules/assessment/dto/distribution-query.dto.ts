import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DistributionQueryDto {
  @ApiPropertyOptional({ description: 'School UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'Filter by term', example: 'Term 1' })
  @IsOptional()
  @IsString()
  term?: string;
}
