import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignCurriculumDto {
  @ApiProperty({
    description: 'Array of school UUIDs to assign the curriculum to',
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  schoolIds: string[];
}
