import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyResetOtpDto {
  @ApiProperty({
    description: 'Email address or phone number the code was sent to',
    example: 'funke.okafor@ignite.edu.ng',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'The 6-digit code from the email', example: '482913' })
  @IsString()
  @Length(6, 6, { message: 'The code is 6 digits' })
  @Matches(/^\d{6}$/, { message: 'The code is 6 digits' })
  code: string;
}
