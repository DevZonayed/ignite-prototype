import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'UI theme preference', enum: ['light', 'dark', 'system'], required: false, example: 'dark' })
  @IsString()
  @IsIn(['light', 'dark', 'system'])
  @IsOptional()
  themePreference?: string;

  @ApiProperty({ description: 'First name', required: false, example: 'Thandi' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false, example: 'Mokoena' })
  @IsString()
  @IsOptional()
  lastName?: string;
}
