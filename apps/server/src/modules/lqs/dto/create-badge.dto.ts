import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBadgeDto {
  @ApiProperty({ description: 'Badge name', example: 'Code Ninja' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Badge description', example: 'Awarded for exceptional coding skills' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon type identifier', example: 'star' })
  @IsString()
  @IsOptional()
  iconType?: string;

  @ApiPropertyOptional({ description: 'JSON trigger rule for auto-award', example: '{"dimension":"Coding","minScore":4}' })
  @IsString()
  @IsOptional()
  triggerRule?: string;
}
