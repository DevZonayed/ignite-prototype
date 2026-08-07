import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'User ID that the OTP was sent to', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Six-digit OTP code', example: '482916' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
