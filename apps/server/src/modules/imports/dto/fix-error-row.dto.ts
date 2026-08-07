import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class FixErrorRowDto {
  @ApiProperty({
    description: 'Corrected row data with field names as keys',
    example: { firstName: 'Jane', email: 'jane@example.com' },
  })
  @IsObject()
  correctedData: Record<string, string>;
}
