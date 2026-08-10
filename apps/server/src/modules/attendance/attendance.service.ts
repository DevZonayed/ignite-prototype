import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import {
  isoWeekLabelExpr,
  weekNumberExpr,
} from '../../common/database/sql-dialect';

import {
  Attendance,
  AttendanceStatus,
} from '../../database/entities/attendance.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { AttendanceRecordDto } from './dto/mark-attendance.dto';
import { HeatmapQueryDto } from './dto/heatmap-query.dto';
import { TrendQueryDto } from './dto/trend-query.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * List attendance records with filters and pagination.
   */
  async findAll(
    filters: AttendanceFilterDto,
  ): Promise<{ data: Attendance[]; total: number; page: number; limit: number }> {
    const {
      classId,
      learnerId,
      lessonSessionId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const where: FindOptionsWhere<Attendance> = {};

    if (classId) {
      where.classId = classId;
    }
    if (learnerId) {
      where.learnerId = learnerId;
    }
    if (lessonSessionId) {
      where.lessonSessionId = lessonSessionId;
    }
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    const [data, total] = await this.attendanceRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Bulk mark attendance for a session (upsert).
   */
  async bulkMark(
    lessonSessionId: string,
    records: AttendanceRecordDto[],
  ): Promise<Attendance[]> {
    const session = await this.lessonSessionRepository.findOne({
      where: { id: lessonSessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Lesson session with ID "${lessonSessionId}" not found`,
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results: Attendance[] = [];

      for (const record of records) {
        const existing = await queryRunner.manager.findOne(Attendance, {
          where: {
            lessonSessionId,
            learnerId: record.learnerId,
          },
        });

        if (existing) {
          existing.status = record.status;
          existing.markedAt = now;
          const updated = await queryRunner.manager.save(Attendance, existing);
          results.push(updated);
        } else {
          const created = queryRunner.manager.create(Attendance, {
            lessonSessionId,
            learnerId: record.learnerId,
            classId: session.classId,
            date: today,
            status: record.status,
            markedAt: now,
          });
          const saved = await queryRunner.manager.save(Attendance, created);
          results.push(saved);
        }
      }

      await queryRunner.commitTransaction();
      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Save/replace all attendance for a session.
   */
  async saveSessionAttendance(
    sessionId: string,
    records: AttendanceRecordDto[],
  ): Promise<Attendance[]> {
    const session = await this.lessonSessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Lesson session with ID "${sessionId}" not found`,
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing records for this session
      await queryRunner.manager.delete(Attendance, {
        lessonSessionId: sessionId,
      });

      // Insert new records
      const entities = records.map((record) =>
        queryRunner.manager.create(Attendance, {
          lessonSessionId: sessionId,
          learnerId: record.learnerId,
          classId: session.classId,
          date: today,
          status: record.status,
          markedAt: now,
        }),
      );

      const saved = await queryRunner.manager.save(Attendance, entities);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get attendance for a specific session with learner details.
   */
  async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    const session = await this.lessonSessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Lesson session with ID "${sessionId}" not found`,
      );
    }

    return this.attendanceRepository.find({
      where: { lessonSessionId: sessionId },
      relations: ['learner'],
      order: { learner: { firstName: 'ASC', lastName: 'ASC' } },
    });
  }

  /**
   * Heat-map data: week x class matrix with attendance percentages.
   */
  async getHeatmap(
    query: HeatmapQueryDto,
  ): Promise<
    { classId: string; className: string; weeks: { week: number; percentage: number }[] }[]
  > {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('a.classId', 'classId')
      .addSelect('c.name', 'className')
      .addSelect(weekNumberExpr(this.dataSource, 'a.date'), 'week')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END)",
        'attended',
      )
      .from(Attendance, 'a')
      .innerJoin('classes', 'c', 'c.id = a.classId')
      .innerJoin('lesson_sessions', 'ls', 'ls.id = a.lessonSessionId')
      .where('c.schoolId = :schoolId', { schoolId: query.schoolId })
      .groupBy('a.classId')
      .addGroupBy('c.name')
      .addGroupBy('week')
      .orderBy('c.name', 'ASC')
      .addOrderBy('week', 'ASC');

    const rows: {
      classId: string;
      className: string;
      week: number;
      total: string;
      attended: string;
    }[] = await qb.getRawMany();

    // Group by class
    const classMap = new Map<
      string,
      { classId: string; className: string; weeks: { week: number; percentage: number }[] }
    >();

    for (const row of rows) {
      if (!classMap.has(row.classId)) {
        classMap.set(row.classId, {
          classId: row.classId,
          className: row.className,
          weeks: [],
        });
      }

      const total = parseInt(row.total, 10);
      const attended = parseInt(row.attended, 10);
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

      classMap.get(row.classId)!.weeks.push({
        week: row.week,
        percentage,
      });
    }

    return Array.from(classMap.values());
  }

  /**
   * Attendance trend over weeks.
   */
  async getTrend(
    query: TrendQueryDto,
  ): Promise<{ week: string; percentage: number }[]> {
    const weeks = query.weeks ?? 6;

    const qb = this.dataSource
      .createQueryBuilder()
      .select(isoWeekLabelExpr(this.dataSource, 'a.date'), 'week')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END)",
        'attended',
      )
      .from(Attendance, 'a')
      .innerJoin('classes', 'c', 'c.id = a.classId')
      .where('c.schoolId = :schoolId', { schoolId: query.schoolId })
      .groupBy('week')
      .orderBy('week', 'DESC')
      .limit(weeks);

    const rows: { week: string; total: string; attended: string }[] =
      await qb.getRawMany();

    return rows
      .map((row) => {
        const total = parseInt(row.total, 10);
        const attended = parseInt(row.attended, 10);
        const percentage =
          total > 0 ? Math.round((attended / total) * 100) : 0;

        return { week: row.week, percentage };
      })
      .reverse();
  }

  /**
   * Assessment distribution (placeholder).
   */
  async getAssessmentDistribution(
    _schoolId: string,
    _term?: string,
  ): Promise<{ emerging: number; developing: number; secure: number }> {
    // Placeholder — requires the Assessment entity to implement fully
    return { emerging: 0, developing: 0, secure: 0 };
  }

  /**
   * Attendance history for a specific learner.
   */
  async getLearnerAttendance(learnerId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { learnerId },
      relations: ['lessonSession'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Weekly attendance for a class.
   */
  async getClassWeeklyAttendance(
    classId: string,
  ): Promise<
    { week: string; present: number; absent: number; late: number }[]
  > {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(isoWeekLabelExpr(this.dataSource, 'a.date'), 'week')
      .addSelect(
        "SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)",
        'present',
      )
      .addSelect(
        "SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END)",
        'absent',
      )
      .addSelect(
        "SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END)",
        'late',
      )
      .from(Attendance, 'a')
      .where('a.classId = :classId', { classId })
      .groupBy('week')
      .orderBy('week', 'DESC');

    const rows: {
      week: string;
      present: string;
      absent: string;
      late: string;
    }[] = await qb.getRawMany();

    return rows.map((row) => ({
      week: row.week,
      present: parseInt(row.present, 10),
      absent: parseInt(row.absent, 10),
      late: parseInt(row.late, 10),
    }));
  }
}
