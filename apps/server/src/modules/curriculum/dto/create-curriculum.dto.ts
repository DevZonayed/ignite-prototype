import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCurriculumDto {
  @ApiProperty({ description: 'Curriculum version name', example: 'STEM Curriculum v3' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
