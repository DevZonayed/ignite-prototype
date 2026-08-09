import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';

export class ActivateDto {
  @ApiProperty({ description: 'Email address or phone number', example: 'teacher@school.co.za' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Invitation code received via email or SMS', example: 'INV-2026-ABCD' })
  @IsString()
  @IsNotEmpty()
  inviteCode: string;

  @ApiProperty({ description: 'New password (min 8 chars, must contain at least one letter and one number)', example: 'Secur3Pass' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({ description: 'User must accept the terms and conditions', example: true })
  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;

  /**
   * The audience the calling app serves. Required, and deliberately so: when it
   * was optional a client that simply omitted it — an old build, a cached
   * bundle — was silently allowed to activate any role, which is the opposite
   * of what a guard should do. Now an app that says nothing is refused.
   *
   * Single-audience clients send their own role: the Teacher app sends
   * `teacher`, the Learner app `learner`. The portals serve every role and
   * route people onward afterwards, so they say `any` — permissive, but stated
   * out loud rather than inferred from a missing field.
   */
  @ApiProperty({
    description:
      'Audience the calling app serves. An invite for any other role is refused. ' +
      'Use "any" for multi-role clients such as the web portals.',
    enum: [
      'platform_admin',
      'curriculum_admin',
      'principal',
      'teacher',
      'learner',
      'parent',
      'any',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'platform_admin',
    'curriculum_admin',
    'principal',
    'teacher',
    'learner',
    'parent',
    'any',
  ])
  role: string;
}
