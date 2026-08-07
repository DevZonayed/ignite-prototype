import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { MediaType } from '../../database/entities/lesson-media.entity';
import { MediaFilterDto } from './dto/media-filter.dto';
import { UploadMediaDto } from './dto/upload-media.dto';

/**
 * Stub media record used until a dedicated Media entity is created.
 */
export interface MediaRecord {
  id: string;
  name: string;
  type: MediaType;
  fileName: string;
  unitId?: string;
  uploadedById: string;
  createdAt: string;
}

@Injectable()
export class MediaService {
  /** In-memory store — replaced by TypeORM repository once entity exists. */
  private readonly mediaItems: MediaRecord[] = [];

  /**
   * List media library items with optional filters and pagination.
   */
  async findAll(
    filters: MediaFilterDto,
  ): Promise<{
    data: MediaRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { type, unitId, page = 1, limit = 20 } = filters;

    let items = [...this.mediaItems];

    if (type) {
      items = items.filter((item) => item.type === type);
    }

    if (unitId) {
      items = items.filter((item) => item.unitId === unitId);
    }

    // Most recent first
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = items.length;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return { data, total, page, limit };
  }

  /**
   * Find a single media item by ID.
   */
  async findById(id: string): Promise<MediaRecord> {
    const item = this.mediaItems.find((m) => m.id === id);
    if (!item) {
      throw new NotFoundException(`Media item with ID "${id}" not found`);
    }
    return item;
  }

  /**
   * Create a media record. File storage is a stub — the record is saved
   * in memory and no actual file I/O occurs.
   */
  async upload(
    dto: UploadMediaDto,
    uploadedById: string,
  ): Promise<MediaRecord> {
    const record: MediaRecord = {
      id: uuidv4(),
      name: dto.name,
      type: dto.type,
      fileName: dto.fileName,
      unitId: dto.unitId,
      uploadedById,
      createdAt: new Date().toISOString(),
    };

    this.mediaItems.push(record);
    return record;
  }

  /**
   * Remove a media item by ID.
   */
  async remove(id: string): Promise<void> {
    const index = this.mediaItems.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Media item with ID "${id}" not found`);
    }
    this.mediaItems.splice(index, 1);
  }
}
