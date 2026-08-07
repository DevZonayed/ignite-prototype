import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';

import { Project, ProjectFileType } from '../../database/entities/project.entity';
import { Attendance, AttendanceStatus } from '../../database/entities/attendance.entity';
import { BadgeAward } from '../../database/entities/badge-award.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PortfolioFilterDto } from './dto/portfolio-filter.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(BadgeAward)
    private readonly badgeAwardRepository: Repository<BadgeAward>,
    @InjectRepository(LqsScore)
    private readonly lqsScoreRepository: Repository<LqsScore>,
    @InjectRepository(LqsDimension)
    private readonly lqsDimensionRepository: Repository<LqsDimension>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,
  ) {}

  /**
   * List portfolio projects with pagination and optional filters.
   */
  async findAll(
    filter: PortfolioFilterDto,
  ): Promise<{ data: Project[]; total: number; page: number; limit: number }> {
    const { learnerId, term, fileType, page = 1, limit = 20 } = filter;

    const where: FindOptionsWhere<Project> = {};

    if (learnerId) {
      where.learnerId = learnerId;
    }
    if (term) {
      where.term = term;
    }
    if (fileType) {
      where.fileType = fileType as ProjectFileType;
    }

    const [data, total] = await this.projectsRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new project record.
   */
  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create({
      ...dto,
      fileType: dto.fileType as ProjectFileType,
    });
    return this.projectsRepository.save(project);
  }

  /**
   * Find a project by ID with learner relation.
   */
  async findById(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['learner'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  /**
   * Update an existing project.
   */
  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);
    Object.assign(project, dto);
    return this.projectsRepository.save(project);
  }

  /**
   * Share a project with parent (triggers notification).
   * TODO: Integrate with notification service.
   */
  async shareProject(id: string): Promise<{ message: string }> {
    const project = await this.findById(id);
    return { message: 'Project shared with parent successfully' };
  }

  /**
   * Get full portfolio for a learner, grouped by file type.
   */
  async getLearnerPortfolio(
    learnerId: string,
  ): Promise<{ learnerId: string; groups: Record<string, Project[]> }> {
    const projects = await this.projectsRepository.find({
      where: { learnerId },
      order: { createdAt: 'DESC' },
    });

    const groups: Record<string, Project[]> = {
      scratch: [],
      python: [],
      robotics: [],
      design: [],
      video: [],
    };

    for (const project of projects) {
      if (groups[project.fileType]) {
        groups[project.fileType].push(project);
      }
    }

    return { learnerId, groups };
  }

  /**
   * Get 3 most recent projects for a learner (for home screen).
   */
  async getRecentProjects(learnerId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { learnerId },
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  /**
   * Get streak + progress for a learner's home screen.
   * Streak = consecutive days with attendance present.
   * Progress = % of curriculum lessons for which the learner has attendance (present).
   */
  async getLearnerProgress(learnerId: string): Promise<{
    streak: number;
    termProgressPercent: number;
    totalBadges: number;
    latestBadge: { name: string; earnedAt: Date } | null;
    overallLqs: number;
  }> {
    // Calculate streak — consecutive present days counting backward from today
    const records = await this.attendanceRepository.find({
      where: { learnerId, status: AttendanceStatus.PRESENT },
      order: { createdAt: 'DESC' },
    });

    let streak = 0;
    if (records.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let expectedDate = new Date(today);

      for (const record of records) {
        const recordDate = new Date(record.createdAt);
        recordDate.setHours(0, 0, 0, 0);

        if (recordDate.getTime() === expectedDate.getTime()) {
          streak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (recordDate.getTime() < expectedDate.getTime()) {
          // Gap found — streak broken
          break;
        }
      }
    }

    // Term progress: how many distinct lessons the learner attended vs total lessons
    const totalLessons = await this.lessonRepository.count();
    const attendedSessions = await this.attendanceRepository
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.lessonSessionId)', 'count')
      .where('a.learnerId = :learnerId', { learnerId })
      .andWhere('a.status = :status', { status: AttendanceStatus.PRESENT })
      .getRawOne();
    const attendedCount = Number(attendedSessions?.count || 0);
    const termProgressPercent = totalLessons > 0
      ? Math.round((attendedCount / totalLessons) * 100)
      : 0;

    // Total badges earned
    const totalBadges = await this.badgeAwardRepository.count({
      where: { learnerId },
    });

    // Latest badge
    const latestAward = await this.badgeAwardRepository.findOne({
      where: { learnerId },
      relations: ['badge'],
      order: { createdAt: 'DESC' },
    });
    const latestBadge = latestAward
      ? { name: latestAward.badge?.name || 'Badge', earnedAt: latestAward.createdAt }
      : null;

    // Overall LQS
    const scores = await this.lqsScoreRepository.find({ where: { learnerId } });
    const dimensions = await this.lqsDimensionRepository.find();
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

    return { streak, termProgressPercent, totalBadges, latestBadge, overallLqs };
  }
}
