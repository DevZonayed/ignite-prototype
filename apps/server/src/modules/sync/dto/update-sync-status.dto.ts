import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateSyncStatusDto {
  @ApiProperty({
    description: 'New status for the sync item',
    enum: ['pending', 'syncing', 'synced', 'failed'],
    example: 'synced',
  })
  @IsEnum(['pending', 'syncing', 'synced', 'failed'])
  @IsNotEmpty()
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}
