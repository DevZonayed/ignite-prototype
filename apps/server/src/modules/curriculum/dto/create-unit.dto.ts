import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ description: 'Unit title', example: 'Introduction to Robotics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Display order within the curriculum', example: 1 })
  @IsInt()
  @Min(1)
  order: number;
}
