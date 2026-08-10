import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class LinkChildrenDto {
  @ApiProperty({
    description: 'Learner UUIDs to link to this parent',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  childIds: string[];
}
