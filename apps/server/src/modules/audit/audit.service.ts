import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { AuditLog } from '../../database/entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditFilterDto } from './dto/audit-filter.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * List audit log entries with pagination and optional filters.
   */
  async findAll(
    filters: AuditFilterDto,
  ): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const { event, startDate, endDate, actorId, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<AuditLog> = {};

    if (event) {
      where.event = event;
    }
    if (actorId) {
      where.actorId = actorId;
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new audit log entry.
   */
  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...dto,
      timestamp: new Date(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Export all matching audit log entries (no pagination).
   */
  async export(filters: AuditFilterDto): Promise<{ data: AuditLog[] }> {
    const { event, startDate, endDate, actorId } = filters;

    const where: FindOptionsWhere<AuditLog> = {};

    if (event) {
      where.event = event;
    }
    if (actorId) {
      where.actorId = actorId;
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const data = await this.auditLogRepository.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: { createdAt: 'DESC' },
    });

    return { data };
  }
}
