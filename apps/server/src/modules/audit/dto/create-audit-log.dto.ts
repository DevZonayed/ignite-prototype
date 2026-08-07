import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { AuditResult } from '../../../database/entities/audit-log.entity';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'Event type that occurred',
    example: 'user.login',
  })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({
    description: 'UUID of the user who performed the action',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  actorId: string;

  @ApiProperty({
    description: 'Display name of the user who performed the action',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  actorName: string;

  @ApiProperty({
    description: 'Identifier of the resource that was affected',
    example: 'user:abc-123',
  })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiProperty({
    description: 'Outcome of the action',
    enum: AuditResult,
    example: AuditResult.OK,
  })
  @IsEnum(AuditResult)
  @IsNotEmpty()
  result: AuditResult;
}
