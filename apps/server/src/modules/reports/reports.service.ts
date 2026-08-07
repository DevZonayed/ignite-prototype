import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import {
  ProgressReport,
  ProgressReportStatus,
  GeneratedBy,
} from '../../database/entities/progress-report.entity';
import { SchoolReport } from '../../database/entities/school-report.entity';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';
import { UpdateProgressReportDto } from './dto/update-progress-report.dto';
import { PublishReportDto } from './dto/publish-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { CreateSchoolReportDto } from './dto/create-school-report.dto';
import { SchoolReportFilterDto } from './dto/school-report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ProgressReport)
    private readonly progressReportRepository: Repository<ProgressReport>,

    @InjectRepository(SchoolReport)
    private readonly schoolReportRepository: Repository<SchoolReport>,
  ) {}

  // ── Progress Reports ──────────────────────────────────────────────

  /**
   * List progress reports with pagination and optional filters.
   */
  async getProgressReports(
    filter: ReportFilterDto,
  ): Promise<{ data: ProgressReport[]; total: number; page: number; limit: number }> {
    const { childId, term, status, page = 1, limit = 20 } = filter;

    const where: FindOptionsWhere<ProgressReport> = {};

    if (childId) {
      where.childId = childId;
    }
    if (term) {
      where.term = term;
    }
    if (status) {
      where.status = status as ProgressReportStatus;
    }

    const [data, total] = await this.progressReportRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Get a single progress report by ID.
   */
  async getProgressReport(id: string): Promise<ProgressReport> {
    const report = await this.progressReportRepository.findOne({
      where: { id },
      relations: ['child'],
    });
    if (!report) {
      throw new NotFoundException(`Progress report with ID "${id}" not found`);
    }
    return report;
  }

  /**
   * Create a new progress report (AI-generated draft).
   */
  async createProgressReport(dto: CreateProgressReportDto): Promise<ProgressReport> {
    // TODO: Integrate actual AI text generation
    const report = this.progressReportRepository.create({
      childId: dto.childId,
      term: dto.term,
      programme: dto.programme,
      generatedBy: GeneratedBy.AI,
      status: ProgressReportStatus.DRAFT,
      whatWentWell: 'AI-generated summary pending integration',
      skillsGrowing: ['Coding', 'Creativity'],
      nextSteps: 'AI-generated next steps pending integration',
    });

    return this.progressReportRepository.save(report);
  }

  /**
   * Update a progress report before publishing.
   */
  async updateProgressReport(
    id: string,
    dto: UpdateProgressReportDto,
  ): Promise<ProgressReport> {
    const report = await this.progressReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Progress report with ID "${id}" not found`);
    }

    Object.assign(report, dto);
    return this.progressReportRepository.save(report);
  }

  /**
   * Publish a progress report (mark as reviewed and visible to parents).
   */
  async publishProgressReport(
    id: string,
    dto: PublishReportDto,
  ): Promise<ProgressReport> {
    const report = await this.progressReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Progress report with ID "${id}" not found`);
    }

    report.status = ProgressReportStatus.PUBLISHED;
    report.reviewedBy = dto.reviewedBy;
    report.reviewedByRole = dto.reviewedByRole;
    report.publishedAt = new Date();

    return this.progressReportRepository.save(report);
  }

  // ── School Reports ────────────────────────────────────────────────

  /**
   * List school reports with pagination and optional filters.
   */
  async getSchoolReports(
    filter: SchoolReportFilterDto,
  ): Promise<{ data: SchoolReport[]; total: number; page: number; limit: number }> {
    const { schoolId, term, type, page = 1, limit = 20 } = filter;

    const where: FindOptionsWhere<SchoolReport> = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (term) {
      where.term = term;
    }
    if (type) {
      where.type = type as any;
    }

    const [data, total] = await this.schoolReportRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new school report with placeholder data.
   */
  async createSchoolReport(dto: CreateSchoolReportDto): Promise<SchoolReport> {
    const report = this.schoolReportRepository.create({
      schoolId: dto.schoolId,
      type: dto.type as any,
      term: dto.term,
      data: { summary: 'Report data pending generation' },
    });

    return this.schoolReportRepository.save(report);
  }

  /**
   * Download a school report as PDF (placeholder).
   */
  async downloadSchoolReport(
    id: string,
  ): Promise<{ message: string; report: SchoolReport }> {
    const report = await this.schoolReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`School report with ID "${id}" not found`);
    }

    return { message: 'PDF generation not yet implemented', report };
  }
}
