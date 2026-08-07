import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'jane.doe@school.co.za', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User phone number', example: '+27821234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User first name', example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User role on the platform',
    enum: ['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent'],
    example: 'teacher',
  })
  @IsEnum(['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent'])
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'ID of the school the user belongs to', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', required: false })
  @IsUUID()
  @IsOptional()
  schoolId?: string;
}
