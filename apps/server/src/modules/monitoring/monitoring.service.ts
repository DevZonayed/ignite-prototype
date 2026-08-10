import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { School } from '../../database/entities/school.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { isoDayExpr } from '../../common/database/sql-dialect';

@Injectable()
export class MonitoringService {
  private readonly startTime = Date.now();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(School)
    private readonly schoolsRepository: Repository<School>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(LessonSession)
    private readonly lessonSessionsRepository: Repository<LessonSession>,
  ) {}

  /**
   * Admin platform-wide dashboard: aggregate counts across all schools.
   */
  async getPlatformDashboard(): Promise<{
    totalSchools: number;
    totalTeachers: number;
    totalLearners: number;
    totalLessons: number;
    lessonsThisWeek: number;
    activeTeachers: number;
    activeLearners: number;
    syncHealthPercent: number;
  }> {
    const totalSchools = await this.schoolsRepository.count();
    const totalTeachers = await this.usersRepository.count({
      where: { role: UserRole.TEACHER, status: UserStatus.ACTIVE },
    });
    const totalLearners = await this.usersRepository.count({
      where: { role: UserRole.LEARNER, status: UserStatus.ACTIVE },
    });
    const totalLessons = await this.lessonsRepository.count();

    // Lessons delivered this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lessonsThisWeek = await this.lessonSessionsRepository
      .createQueryBuilder('ls')
      .where('ls.startedAt >= :weekAgo', { weekAgo: weekAgo.toISOString() })
      .getCount();

    // Active teachers (logged in last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const activeTeachers = await this.usersRepository
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.TEACHER })
      .andWhere('u.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('u.lastActiveAt >= :monthAgo', { monthAgo: monthAgo.toISOString() })
      .getCount();

    const activeLearners = await this.usersRepository.count({
      where: { role: UserRole.LEARNER, status: UserStatus.ACTIVE },
    });

    // Sync health
    const totalSessions = await this.lessonSessionsRepository.count();
    const syncedSessions = await this.lessonSessionsRepository.count({
      where: { syncStatus: 'synced' as any },
    });
    const syncHealthPercent = totalSessions > 0
      ? Math.round((syncedSessions / totalSessions) * 100)
      : 100;

    return {
      totalSchools,
      totalTeachers,
      totalLearners,
      totalLessons,
      lessonsThisWeek,
      activeTeachers,
      activeLearners,
      syncHealthPercent,
    };
  }

  /**
   * Platform-level monitoring stats.
   */
  async getStats(
    schoolId?: string,
  ): Promise<{
    activeLearners: number;
    syncHealthPercent: number;
    aiCallsToday: number;
  }> {
    // Count active learners
    const activeLearnerQuery: Record<string, unknown> = {
      role: 'learner' as const,
      status: UserStatus.ACTIVE,
    };
    if (schoolId) {
      activeLearnerQuery.schoolId = schoolId;
    }
    const activeLearners = await this.usersRepository.count({
      where: activeLearnerQuery as any,
    });

    // Sync health: percentage of lesson sessions that are fully synced
    const totalSessionsQuery = this.lessonSessionsRepository
      .createQueryBuilder('ls')
      .select('COUNT(*)', 'total');
    const syncedSessionsQuery = this.lessonSessionsRepository
      .createQueryBuilder('ls')
      .select('COUNT(*)', 'synced')
      .where('ls.syncStatus = :status', { status: 'synced' });

    if (schoolId) {
      totalSessionsQuery
        .innerJoin('ls.teacher', 'u')
        .andWhere('u.schoolId = :schoolId', { schoolId });
      syncedSessionsQuery
        .innerJoin('ls.teacher', 'u')
        .andWhere('u.schoolId = :schoolId', { schoolId });
    }

    const { total } = await totalSessionsQuery.getRawOne();
    const { synced } = await syncedSessionsQuery.getRawOne();

    const totalNum = Number(total) || 0;
    const syncedNum = Number(synced) || 0;
    const syncHealthPercent =
      totalNum > 0 ? Math.round((syncedNum / totalNum) * 100) : 100;

    // AI calls today — placeholder until AI usage tracking is wired up
    const aiCallsToday = 0;

    return { activeLearners, syncHealthPercent, aiCallsToday };
  }

  /**
   * Lessons delivered per day for a given week (bar-chart data).
   */
  async getLessonsDelivered(
    schoolId?: string,
    week?: string,
  ): Promise<{ day: string; count: number }[]> {
    const weekStart = week ? new Date(week) : this.getMonday(new Date());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const qb = this.lessonSessionsRepository
      .createQueryBuilder('ls')
      .select(
        isoDayExpr(this.lessonSessionsRepository.manager.connection, 'ls.startedAt'),
        'day',
      )
      .addSelect('COUNT(*)', 'count')
      .where('ls.startedAt >= :start AND ls.startedAt < :end', {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      })
      .groupBy('day')
      .orderBy('day', 'ASC');

    if (schoolId) {
      qb.innerJoin('ls.teacher', 'u').andWhere('u.schoolId = :schoolId', {
        schoolId,
      });
    }

    const rows: { day: string; count: string }[] = await qb.getRawMany();

    // Build a full 7-day array so the chart always has all days
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result: { day: string; count: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const match = rows.find((r) => r.day === iso);
      result.push({
        day: dayLabels[i],
        count: match ? Number(match.count) : 0,
      });
    }

    return result;
  }

  /**
   * System health check.
   */
  async getHealth(): Promise<{
    status: 'ok' | 'degraded';
    database: boolean;
    uptime: number;
  }> {
    let database = false;

    try {
      await this.usersRepository.query('SELECT 1');
      database = true;
    } catch {
      database = false;
    }

    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const status = database ? 'ok' : 'degraded';

    return { status, database, uptime };
  }

  /**
   * Return the Monday of the week containing the given date.
   */
  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  }
}
