import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DeepPartial } from 'typeorm';

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
   * Applies every filter the admin portal can send.
   *
   * Built as a query builder rather than a `where` object because `search` has
   * to span several columns at once, which `FindOptionsWhere` cannot express
   * without turning into an OR-array that then fights the other filters.
   */
  private buildQuery(filters: AuditFilterDto): SelectQueryBuilder<AuditLog> {
    const {
      event,
      search,
      actorId,
      actorRole,
      source,
      method,
      result,
      statusCode,
      startDate,
      endDate,
    } = filters;

    const qb = this.auditLogRepository.createQueryBuilder('log');

    if (event) qb.andWhere('log.event = :event', { event });
    if (actorId) qb.andWhere('log.actorId = :actorId', { actorId });
    if (actorRole) qb.andWhere('log.actorRole = :actorRole', { actorRole });
    if (source) qb.andWhere('log.source = :source', { source });
    if (method) qb.andWhere('log.method = :method', { method });
    if (result) qb.andWhere('log.result = :result', { result });
    if (statusCode) qb.andWhere('log.statusCode = :statusCode', { statusCode });

    if (search) {
      // LOWER() on both sides rather than ILIKE: ILIKE is Postgres-only and the
      // test suite runs the same code on sql.js.
      qb.andWhere(
        `(LOWER(log.event) LIKE :q
          OR LOWER(log.actorName) LIKE :q
          OR LOWER(log.actorEmail) LIKE :q
          OR LOWER(log.path) LIKE :q
          OR LOWER(log.target) LIKE :q)`,
        { q: `%${search.toLowerCase()}%` },
      );
    }

    if (startDate) {
      qb.andWhere('log.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    return qb;
  }

  /**
   * List audit log entries with pagination and filters.
   */
  async findAll(
    filters: AuditFilterDto,
  ): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = filters;

    const [data, total] = await this.buildQuery(filters)
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * One entry in full, for the detail panel.
   */
  async findOne(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({ where: { id } });

    if (!log) {
      throw new NotFoundException(`Audit entry ${id} not found`);
    }

    return log;
  }

  /**
   * The distinct values behind the filter dropdowns, so the portal offers what
   * actually exists rather than a hardcoded list that drifts from reality.
   */
  async facets(): Promise<{
    events: string[];
    roles: string[];
    sources: string[];
    methods: string[];
    actors: { actorId: string; actorName: string }[];
  }> {
    const distinct = async (column: string): Promise<string[]> => {
      const rows = await this.auditLogRepository
        .createQueryBuilder('log')
        .select(`log.${column}`, 'value')
        .where(`log.${column} IS NOT NULL`)
        .groupBy(`log.${column}`)
        .orderBy(`log.${column}`, 'ASC')
        .limit(200)
        .getRawMany();

      return rows.map((r) => r.value).filter(Boolean);
    };

    const actorRows = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.actorId', 'actorId')
      .addSelect('MAX(log.actorName)', 'actorName')
      .where('log.actorId IS NOT NULL')
      .groupBy('log.actorId')
      .orderBy('MAX(log.actorName)', 'ASC')
      .limit(200)
      .getRawMany();

    const [events, roles, sources, methods] = await Promise.all([
      distinct('event'),
      distinct('actorRole'),
      distinct('source'),
      distinct('method'),
    ]);

    return {
      events,
      roles,
      sources,
      methods,
      actors: actorRows.filter((a) => a.actorId),
    };
  }

  /**
   * Write an entry. Used by `AuditInterceptor` on every request, so it takes
   * the whole shape at once rather than the narrow public DTO.
   */
  async record(entry: DeepPartial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...entry,
      timestamp: new Date(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Create a new audit log entry from the public endpoint.
   */
  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.record(dto as DeepPartial<AuditLog>);
  }

  /**
   * Export all matching entries (no pagination).
   */
  async export(filters: AuditFilterDto): Promise<{ data: AuditLog[] }> {
    const data = await this.buildQuery(filters)
      .orderBy('log.createdAt', 'DESC')
      .limit(10000)
      .getMany();

    return { data };
  }
}
