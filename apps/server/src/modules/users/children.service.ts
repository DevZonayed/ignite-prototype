import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { User } from '../../database/entities/user.entity';
import { ParentChild } from '../../database/entities/parent-child.entity';
import { Attendance, AttendanceStatus } from '../../database/entities/attendance.entity';
import { Project } from '../../database/entities/project.entity';
import { ProgressReport } from '../../database/entities/progress-report.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { Certificate } from '../../database/entities/certificate.entity';
import { Evidence } from '../../database/entities/evidence.entity';
import { HomeworkSubmission, ReviewStatus } from '../../database/entities/homework-submission.entity';
import { Homework } from '../../database/entities/homework.entity';
import { Notification } from '../../database/entities/notification.entity';
import { ChildrenFilterDto } from './dto/children-filter.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ParentChild)
    private readonly parentChildRepository: Repository<ParentChild>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProgressReport)
    private readonly progressReportRepository: Repository<ProgressReport>,

    @InjectRepository(LqsScore)
    private readonly lqsScoreRepository: Repository<LqsScore>,

    @InjectRepository(LqsDimension)
    private readonly lqsDimensionRepository: Repository<LqsDimension>,

    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,

    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,

    @InjectRepository(HomeworkSubmission)
    private readonly homeworkSubmissionRepository: Repository<HomeworkSubmission>,

    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Find all children linked to a parent via the parent_children table.
   */
  async findChildrenForParent(
    parentId: string,
    filters: ChildrenFilterDto,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = filters;

    const [links, total] = await this.parentChildRepository.findAndCount({
      where: { parentId },
      relations: ['child'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = links.map((link) => link.child);

    return { data, total, page, limit };
  }

  /**
   * Get a weekly activity summary for a child from real data.
   */
  async getWeeklySummary(
    childId: string,
  ): Promise<{ daysPresent: number; activeProjects: number; newReports: number }> {
    // Attendance this week (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        learnerId: childId,
        createdAt: MoreThanOrEqual(weekAgo),
      },
    });
    const daysPresent = attendanceRecords.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;

    // Active projects
    const activeProjects = await this.projectRepository.count({
      where: { learnerId: childId },
    });

    // New reports this month
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const newReports = await this.progressReportRepository.count({
      where: {
        childId,
        createdAt: MoreThanOrEqual(monthAgo),
      },
    });

    return { daysPresent, activeProjects, newReports };
  }

  /**
   * Get attendance data for a child from real DB records.
   */
  async getAttendance(
    childId: string,
  ): Promise<{ termPercent: number; weeklyBreakdown: { week: string; percent: number }[] }> {
    // Get all attendance records for this child
    const records = await this.attendanceRepository.find({
      where: { learnerId: childId },
      order: { createdAt: 'DESC' },
    });

    const total = records.length;
    const present = records.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;
    const termPercent = total > 0 ? Math.round((present / total) * 100) : 0;

    // Group by week
    const weekMap = new Map<string, { total: number; present: number }>();
    for (const record of records) {
      const date = new Date(record.createdAt);
      // Get Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekKey = monday.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { total: 0, present: 0 });
      }
      const week = weekMap.get(weekKey)!;
      week.total++;
      if (record.status === AttendanceStatus.PRESENT) {
        week.present++;
      }
    }

    const weeklyBreakdown = Array.from(weekMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 8)
      .map(([week, stats]) => ({
        week,
        percent: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      }));

    return { termPercent, weeklyBreakdown };
  }

  /**
   * Get portfolio items for a child from real DB (projects, evidence, certificates).
   */
  async getPortfolio(
    childId: string,
  ): Promise<{ id: string; title: string; type: string; date: string; thumbnailUrl?: string }[]> {
    // Get projects
    const projects = await this.projectRepository.find({
      where: { learnerId: childId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    // Get evidence tagged to this child
    const evidence = await this.evidenceRepository.find({
      where: { teacherId: childId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    // Get certificates
    const certificates = await this.certificateRepository.find({
      where: { learnerId: childId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const items: { id: string; title: string; type: string; date: string; thumbnailUrl?: string }[] = [];

    for (const p of projects) {
      items.push({
        id: p.id,
        title: p.title,
        type: p.fileType || 'project',
        date: (p.createdAt as Date).toISOString().split('T')[0],
        thumbnailUrl: p.fileUrl || undefined,
      });
    }

    for (const e of evidence) {
      items.push({
        id: e.id,
        title: `Evidence (${e.mediaType})`,
        type: 'evidence',
        date: (e.createdAt as Date).toISOString().split('T')[0],
        thumbnailUrl: e.fileUrl || undefined,
      });
    }

    for (const c of certificates) {
      items.push({
        id: c.id,
        title: c.course || `Certificate ${c.id}`,
        type: 'certificate',
        date: (c.createdAt as Date).toISOString().split('T')[0],
      });
    }

    // Sort by date descending
    items.sort((a, b) => b.date.localeCompare(a.date));

    return items;
  }

  /**
   * Get skill dimensions with levels and the overall LQS score for a child from real DB.
   */
  async getSkills(
    childId: string,
  ): Promise<{ dimensions: { name: string; level: number; color: string }[]; overallLqs: number }> {
    // Get all LQS scores for this child
    const scores = await this.lqsScoreRepository.find({
      where: { learnerId: childId },
    });

    // Get all dimensions
    const dimensions = await this.lqsDimensionRepository.find({
      order: { name: 'ASC' },
    });

    // Build dimension list with scores
    const dimensionResults = dimensions.map((dim) => {
      const score = scores.find((s) => s.dimensionId === dim.id);
      return {
        name: dim.name,
        level: score ? score.score : 0,
        color: dim.color || '#6B7280',
      };
    });

    // Compute overall weighted LQS
    let weightedSum = 0;
    let totalWeight = 0;
    for (const dim of dimensions) {
      const score = scores.find((s) => s.dimensionId === dim.id);
      if (score) {
        weightedSum += score.score * (dim.weight || 1);
        totalWeight += dim.weight || 1;
      }
    }
    const overallLqs = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

    return { dimensions: dimensionResults, overallLqs };
  }

  /**
   * Get action feed items for a child from real DB.
   */
  async getFeed(
    childId: string,
  ): Promise<{ type: string; title: string; date: string; actionRequired: boolean }[]> {
    const feedItems: { type: string; title: string; date: string; actionRequired: boolean }[] = [];

    // Pending homework submissions
    const pendingSubmissions = await this.homeworkSubmissionRepository.find({
      where: {
        learnerId: childId,
        reviewStatus: ReviewStatus.PENDING,
      },
      relations: ['homework'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
    for (const sub of pendingSubmissions) {
      feedItems.push({
        type: 'homework',
        title: sub.homework?.title || 'Homework submission pending',
        date: (sub.createdAt as Date).toISOString().split('T')[0],
        actionRequired: true,
      });
    }

    // Recent progress reports
    const recentReports = await this.progressReportRepository.find({
      where: { childId },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    for (const report of recentReports) {
      feedItems.push({
        type: 'report',
        title: `${report.term || 'Progress'} report ${report.status === 'published' ? 'available' : 'in progress'}`,
        date: (report.createdAt as Date).toISOString().split('T')[0],
        actionRequired: false,
      });
    }

    // Recent notifications for the child
    const notifications = await this.notificationRepository.find({
      where: { userId: childId },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    for (const notif of notifications) {
      feedItems.push({
        type: 'notification',
        title: notif.title,
        date: (notif.createdAt as Date).toISOString().split('T')[0],
        actionRequired: !notif.read,
      });
    }

    // Sort by date descending
    feedItems.sort((a, b) => b.date.localeCompare(a.date));

    return feedItems.slice(0, 20);
  }
}
