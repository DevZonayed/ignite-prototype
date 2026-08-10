import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class EnrolLearnersDto {
  @ApiProperty({
    description: 'Learner UUIDs to place on this class register',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  learnerIds: string[];
}
