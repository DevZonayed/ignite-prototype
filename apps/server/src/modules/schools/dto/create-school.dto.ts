import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { SchoolRegion } from '../../../database/entities/school.entity';

/**
 * Login credentials for the person who runs the school. Every school is created
 * with one, so a school can never exist without somebody able to administer it.
 *
 * Only email and password are collected: the account is usable immediately, and
 * the principal fills in their own details from their profile afterwards.
 */
export class SchoolPrincipalDto {
  @ApiProperty({
    description: 'Email the principal signs in with',
    example: 'ngozi.bello@school.edu.ng',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password, at least 8 characters with a letter and a number',
    example: 'Principal2026',
  })
  @IsString()
  @MinLength(8, { message: 'The principal password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'The principal password must contain at least one letter and one number',
  })
  password: string;
}

export class CreateSchoolDto {
  @ApiProperty({ description: 'School name', example: 'Bright Future Academy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Region the school operates in', enum: SchoolRegion })
  @IsEnum(SchoolRegion)
  @IsNotEmpty()
  region: SchoolRegion;

  @ApiProperty({
    description: 'Principal account created alongside the school',
    type: SchoolPrincipalDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SchoolPrincipalDto)
  @IsNotEmpty()
  principal: SchoolPrincipalDto;

  @ApiProperty({ description: 'Curriculum version to assign', required: false })
  @IsOptional()
  @IsUUID()
  curriculumVersionId?: string;

  @ApiProperty({ description: 'IANA timezone', example: 'Africa/Lagos', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Academic year', example: '2025/2026', required: false })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ description: 'Current term', example: 'Term 1', required: false })
  @IsOptional()
  @IsString()
  currentTerm?: string;

  @ApiProperty({ description: 'Subject taught', example: 'Digital Innovation', required: false })
  @IsOptional()
  @IsString()
  subject?: string;
}
