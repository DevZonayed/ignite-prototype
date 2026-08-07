import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class SignInDto {
  @ApiProperty({ description: 'Email address or phone number', example: 'teacher@school.co.za' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Password', example: 'P@ssw0rd123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User role', enum: ['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent'] })
  @IsEnum(['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent'])
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Remember me for extended session', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
