import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, MinLength, Matches } from 'class-validator';

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
}
