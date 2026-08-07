import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class ColumnMappingDto {
  @ApiProperty({
    description: 'Mapping of CSV column headers to system field names',
    example: { 'Name': 'firstName', 'Email': 'email' },
  })
  @IsObject()
  mapping: Record<string, string>;
}
