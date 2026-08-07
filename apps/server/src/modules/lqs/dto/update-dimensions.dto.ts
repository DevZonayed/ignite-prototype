import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DimensionItemDto {
  @ApiPropertyOptional({ description: 'Dimension UUID (omit for new)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Dimension name', example: 'Coding' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Hex colour for the dimension', example: '#2563EB' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'Weight as a percentage (all must total 100)', example: 15 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}

export class UpdateDimensionsDto {
  @ApiProperty({
    description: 'Array of dimension definitions — weights must total 100',
    type: [DimensionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DimensionItemDto)
  dimensions: DimensionItemDto[];

  @ApiPropertyOptional({ description: 'Rubric version number', example: 2 })
  @IsInt()
  @IsOptional()
  rubricVersion?: number;
}
