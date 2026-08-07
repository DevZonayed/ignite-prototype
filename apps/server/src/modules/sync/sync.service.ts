import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SyncQueue, SyncQueueStatus } from '../../database/entities/sync-queue.entity';
import { CreateSyncItemDto } from './dto/create-sync-item.dto';
import { UpdateSyncStatusDto } from './dto/update-sync-status.dto';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncQueue)
    private readonly syncQueueRepository: Repository<SyncQueue>,
  ) {}

  /**
   * Return the paginated sync queue for a given teacher.
   */
  async findQueue(
    teacherId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: SyncQueue[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.syncQueueRepository.findAndCount({
      where: { teacherId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Trigger a manual sync for all pending items belonging to the teacher.
   * Moves all QUEUED and FAILED items to SYNCING status.
   */
  async triggerSync(
    teacherId: string,
  ): Promise<{ message: string; itemsQueued: number }> {
    const pendingItems = await this.syncQueueRepository.find({
      where: [
        { teacherId, status: SyncQueueStatus.QUEUED },
        { teacherId, status: SyncQueueStatus.FAILED },
      ],
    });

    for (const item of pendingItems) {
      item.status = SyncQueueStatus.SYNCING;
      item.attempts = (item.attempts || 0) + 1;
    }

    if (pendingItems.length > 0) {
      await this.syncQueueRepository.save(pendingItems);
    }

    // In a real system, this would trigger background sync jobs.
    // For now, mark them as synced after "processing".
    for (const item of pendingItems) {
      item.status = SyncQueueStatus.SYNCED;
    }
    if (pendingItems.length > 0) {
      await this.syncQueueRepository.save(pendingItems);
    }

    return { message: 'Sync triggered', itemsQueued: pendingItems.length };
  }

  /**
   * Remove a sync item from the queue.
   */
  async removeItem(id: string, teacherId: string): Promise<void> {
    const item = await this.syncQueueRepository.findOne({
      where: { id, teacherId },
    });
    if (!item) {
      throw new NotFoundException(`Sync item with ID "${id}" not found`);
    }
    await this.syncQueueRepository.remove(item);
  }

  /**
   * Push a new item onto the sync queue.
   */
  async pushItems(
    teacherId: string,
    dto: CreateSyncItemDto,
  ): Promise<SyncQueue> {
    const item = this.syncQueueRepository.create({
      teacherId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      description: dto.description,
      fileSizeKb: dto.fileSizeKb,
      status: SyncQueueStatus.QUEUED,
      queuedAt: new Date(),
    });
    return this.syncQueueRepository.save(item);
  }

  /**
   * Update the status of an existing sync item.
   */
  async updateItemStatus(
    id: string,
    dto: UpdateSyncStatusDto,
  ): Promise<SyncQueue> {
    const item = await this.syncQueueRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Sync item with ID "${id}" not found`);
    }
    item.status = dto.status as SyncQueueStatus;
    return this.syncQueueRepository.save(item);
  }
}
