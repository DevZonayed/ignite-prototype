import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';

import {
  ProgressReport,
  ProgressReportStatus,
  GeneratedBy,
} from '../../database/entities/progress-report.entity';
import {
  SchoolReport,
  SchoolReportType,
} from '../../database/entities/school-report.entity';
import { Class } from '../../database/entities/class.entity';
import { School } from '../../database/entities/school.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import {
  Attendance,
  AttendanceStatus,
} from '../../database/entities/attendance.entity';
import { Project } from '../../database/entities/project.entity';
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

    // School reports are computed from live records, so the service reads the
    // tables the report describes rather than storing a placeholder.
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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
   * Create a school report, computing it at the point of request.
   *
   * This used to store `{ summary: 'Report data pending generation' }` and
   * nothing ever generated it, so the Reports view listed rows that held no
   * report. Each type below is derived from live data instead.
   */
  async createSchoolReport(
    dto: CreateSchoolReportDto,
    generatedBy?: string,
  ): Promise<SchoolReport> {
    const school = await this.schoolRepository.findOne({
      where: { id: dto.schoolId },
    });
    if (!school) {
      throw new NotFoundException(`School with ID "${dto.schoolId}" not found`);
    }

    const data = await this.buildSchoolReportData(
      dto.schoolId,
      dto.type as SchoolReportType,
      dto.term,
    );

    const report = this.schoolReportRepository.create({
      schoolId: dto.schoolId,
      type: dto.type as any,
      term: dto.term,
      data,
      generatedBy: generatedBy ?? undefined,
    });

    return this.schoolReportRepository.save(report);
  }

  /** Compute the body of a school report from current records. */
  private async buildSchoolReportData(
    schoolId: string,
    type: SchoolReportType,
    term?: string,
  ): Promise<Record<string, any>> {
    const classes = await this.classRepository.find({ where: { schoolId } });
    const classIds = classes.map((c) => c.id);
    const generatedAt = new Date().toISOString();

    if (type === SchoolReportType.COVERAGE_SUMMARY) {
      const rows = classes.map((c) => ({
        className: c.name,
        gradeLevel: c.gradeLevel ?? null,
        learners: c.learnerCount,
        coveragePercent: Number(c.curriculumCoveragePercent ?? 0),
      }));
      const average = rows.length
        ? Math.round(
            rows.reduce((sum, r) => sum + r.coveragePercent, 0) / rows.length,
          )
        : 0;
      return { generatedAt, term, averageCoveragePercent: average, classes: rows };
    }

    if (type === SchoolReportType.ATTENDANCE_REGISTER) {
      const sessions = classIds.length
        ? await this.lessonSessionRepository.find({
            where: { classId: In(classIds) },
          })
        : [];
      const sessionsByClass = new Map<string, string[]>();
      sessions.forEach((s) => {
        sessionsByClass.set(s.classId, [
          ...(sessionsByClass.get(s.classId) ?? []),
          s.id,
        ]);
      });

      const rows: Record<string, any>[] = [];
      for (const cls of classes) {
        const sessionIds = sessionsByClass.get(cls.id) ?? [];
        const records = sessionIds.length
          ? await this.attendanceRepository.find({
              where: { lessonSessionId: In(sessionIds) },
            })
          : [];
        const present = records.filter(
          (r) => r.status === AttendanceStatus.PRESENT,
        ).length;
        rows.push({
          className: cls.name,
          learners: cls.learnerCount,
          sessions: sessionIds.length,
          marks: records.length,
          present,
          absent: records.length - present,
          attendancePercent: records.length
            ? Math.round((present / records.length) * 100)
            : 0,
        });
      }
      return { generatedAt, term, classes: rows };
    }

    if (type === SchoolReportType.PROJECT_COMPLETION) {
      const learners = await this.userRepository.find({
        where: { schoolId, role: UserRole.LEARNER },
        select: ['id'],
      });
      const learnerIds = learners.map((l) => l.id);
      const projects = learnerIds.length
        ? await this.projectRepository.find({
            where: { learnerId: In(learnerIds) },
          })
        : [];
      const withProject = new Set(projects.map((p) => p.learnerId)).size;
      return {
        generatedAt,
        term,
        learners: learnerIds.length,
        projects: projects.length,
        learnersWithProject: withProject,
        completionPercent: learnerIds.length
          ? Math.round((withProject / learnerIds.length) * 100)
          : 0,
      };
    }

    // TEACHER_ACTIVITY
    const teachers = await this.userRepository.find({
      where: { schoolId, role: UserRole.TEACHER },
    });
    const rows: Record<string, any>[] = [];
    for (const teacher of teachers) {
      const sessions = await this.lessonSessionRepository.count({
        where: { teacherId: teacher.id },
      });
      rows.push({
        teacher: `${teacher.firstName} ${teacher.lastName}`.trim(),
        email: teacher.email,
        classesLed: classes.filter((c) => c.teacherId === teacher.id).length,
        sessionsDelivered: sessions,
        lastActiveAt: teacher.lastActiveAt ?? teacher.lastLoginAt ?? null,
      });
    }
    return { generatedAt, term, teachers: rows };
  }

  /**
   * Download a school report as CSV.
   *
   * Deliberately CSV rather than PDF: it is the format a principal actually
   * reopens in a spreadsheet, and it needs no rendering dependency to be real.
   */
  async downloadSchoolReport(
    id: string,
  ): Promise<{ filename: string; content: string }> {
    const report = await this.schoolReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`School report with ID "${id}" not found`);
    }

    const data: any = report.data ?? {};
    // Every report type is either a list of rows or a single summary object.
    const rows: any[] = Array.isArray(data.classes)
      ? data.classes
      : Array.isArray(data.teachers)
        ? data.teachers
        : [data];

    const headers = Object.keys(rows[0] ?? {}).filter(
      (k) => typeof rows[0][k] !== 'object',
    );
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
    ].join('\n');

    return {
      filename: `${report.type}-${report.id.slice(0, 8)}.csv`,
      content: `${csv}\n`,
    };
  }
}
