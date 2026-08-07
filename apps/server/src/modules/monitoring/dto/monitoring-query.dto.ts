import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class MonitoringQueryDto {
  @ApiPropertyOptional({
    description: 'Filter stats by school UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({
    description:
      'ISO date of the week start (Monday). Defaults to current week if omitted.',
    example: '2026-08-03',
  })
  @IsOptional()
  @IsString()
  week?: string;
}
