import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SenderType } from '../../../database/entities/homework-message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Type of sender',
    enum: SenderType,
    example: SenderType.TEACHER,
  })
  @IsEnum(SenderType)
  @IsNotEmpty()
  senderType: SenderType;

  @ApiProperty({ description: 'Name of the sender', example: 'Mr. Smith' })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiProperty({ description: 'Message body text' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
