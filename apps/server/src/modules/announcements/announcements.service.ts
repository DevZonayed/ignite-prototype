import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateAnnouncementDto,
  AnnouncementAudience,
} from './dto/create-announcement.dto';

/**
 * Stub announcement record used until a dedicated Announcement entity is created.
 */
export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  schoolId?: string;
  classId?: string;
  attachedMediaIds?: string[];
  createdById: string;
  createdAt: string;
}

@Injectable()
export class AnnouncementsService {
  /** In-memory store — replaced by TypeORM repository once entity exists. */
  private readonly announcements: AnnouncementRecord[] = [];

  /**
   * List announcements with pagination, most recent first.
   */
  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: AnnouncementRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const sorted = [...this.announcements].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = sorted.length;
    const start = (page - 1) * limit;
    const data = sorted.slice(start, start + limit);

    return { data, total, page, limit };
  }

  /**
   * Find a single announcement by ID.
   */
  async findById(id: string): Promise<AnnouncementRecord> {
    const announcement = this.announcements.find((a) => a.id === id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }
    return announcement;
  }

  /**
   * Create a new announcement.
   */
  async create(
    dto: CreateAnnouncementDto,
    createdById: string,
  ): Promise<AnnouncementRecord> {
    const announcement: AnnouncementRecord = {
      id: uuidv4(),
      title: dto.title,
      message: dto.message,
      audience: dto.audience,
      schoolId: dto.schoolId,
      classId: dto.classId,
      attachedMediaIds: dto.attachedMediaIds,
      createdById,
      createdAt: new Date().toISOString(),
    };

    this.announcements.push(announcement);
    return announcement;
  }

  /**
   * Remove an announcement by ID.
   */
  async remove(id: string): Promise<void> {
    const index = this.announcements.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }
    this.announcements.splice(index, 1);
  }
}
