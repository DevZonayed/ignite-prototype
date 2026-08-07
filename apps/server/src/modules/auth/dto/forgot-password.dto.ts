import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address or phone number associated with the account', example: 'teacher@school.co.za' })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
