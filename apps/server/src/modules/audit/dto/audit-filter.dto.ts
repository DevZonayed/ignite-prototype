import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by exact event name',
    example: 'users.create',
  })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiPropertyOptional({
    description:
      'Free text match across event, actor name, actor email, path and target',
    example: 'principal@ignite.test',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start date as ISO 8601 string',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date as ISO 8601 string',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by the UUID of the actor',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by the role the actor held',
    example: 'teacher',
  })
  @IsOptional()
  @IsString()
  actorRole?: string;

  @ApiPropertyOptional({
    description: 'Filter by originating app',
    example: 'admin-portal',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Filter by HTTP method', example: 'POST' })
  @IsOptional()
  @IsIn(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
  method?: string;

  @ApiPropertyOptional({
    description: 'Filter by outcome',
    example: 'blocked',
  })
  @IsOptional()
  @IsIn(['ok', 'blocked', 'failed'])
  result?: string;

  @ApiPropertyOptional({ description: 'Filter by HTTP status code', example: 403 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusCode?: number;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of results per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
