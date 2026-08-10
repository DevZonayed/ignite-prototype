import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/**
 * Payload for creating the very first platform administrator.
 * Accepted only while the platform has no platform_admin at all.
 */
export class BootstrapAdminDto {
  @ApiProperty({ description: 'First name', example: 'Ada' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Lovelace' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address used to sign in', example: 'admin@ignite.edu.ng' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password, at least 8 characters with a letter and a number',
    example: 'FirstAdmin2026',
  })
  @IsString()
  @MinLength(8, { message: 'The first admin password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({ description: 'Repeat of the password', example: 'FirstAdmin2026' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
