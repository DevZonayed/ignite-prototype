import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PublishReportDto {
  @ApiProperty({ description: 'Name of the reviewer', example: 'Mrs. Johnson' })
  @IsString()
  @IsNotEmpty()
  reviewedBy: string;

  @ApiProperty({ description: 'Role of the reviewer', example: 'teacher' })
  @IsString()
  @IsNotEmpty()
  reviewedByRole: string;
}
