import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/** Self-service password change for the signed-in user. */
export class ChangePasswordDto {
  @ApiProperty({ description: 'The password currently in use' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password, at least 8 characters with a letter and a number',
    example: 'NewPassword1',
  })
  @IsString()
  @MinLength(8, { message: 'The new password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'The new password must contain at least one letter and one number',
  })
  newPassword: string;

  @ApiProperty({ description: 'Repeat of the new password' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
