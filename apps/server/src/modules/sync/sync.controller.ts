import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SyncService } from './sync.service';
import { CreateSyncItemDto } from './dto/create-sync-item.dto';
import { UpdateSyncStatusDto } from './dto/update-sync-status.dto';

@ApiTags('sync')
@ApiBearerAuth()
@Controller('sync')
// Every route here is the teacher app's own offline queue, scoped to the
// caller's id — no other role has a queue to read or write.
@Roles('teacher', 'platform_admin')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('queue')
  @ApiOperation({ summary: 'List pending/failed sync items for the authenticated teacher' })
  @ApiResponse({ status: 200, description: 'Paginated list of sync queue items' })
  async findQueue(
    @CurrentUser('id') teacherId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.syncService.findQueue(teacherId, +page, +limit);
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger a manual sync for all pending items' })
  @ApiResponse({ status: 201, description: 'Sync triggered successfully' })
  async triggerSync(@CurrentUser('id') teacherId: string) {
    return this.syncService.triggerSync(teacherId);
  }

  @Delete('queue/:id')
  @ApiOperation({ summary: 'Remove a failed sync item from the queue' })
  @ApiParam({ name: 'id', description: 'Sync item UUID' })
  @ApiResponse({ status: 200, description: 'Sync item removed' })
  @ApiResponse({ status: 404, description: 'Sync item not found' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser('id') teacherId: string,
  ) {
    return this.syncService.removeItem(id, teacherId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Push a new item onto the sync queue' })
  @ApiResponse({ status: 201, description: 'Sync item created' })
  async pushItems(
    @Body() dto: CreateSyncItemDto,
    @CurrentUser('id') teacherId: string,
  ) {
    return this.syncService.pushItems(teacherId, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update the status of a sync item' })
  @ApiParam({ name: 'id', description: 'Sync item UUID' })
  @ApiResponse({ status: 200, description: 'Sync item status updated' })
  @ApiResponse({ status: 404, description: 'Sync item not found' })
  async updateItemStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSyncStatusDto,
  ) {
    return this.syncService.updateItemStatus(id, dto);
  }
}
