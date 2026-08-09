import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { Assessment } from '../../database/entities/assessment.entity';
import { AssessmentFilterDto } from './dto/assessment-filter.dto';
import { AssessmentItemDto } from './dto/create-assessment-bulk.dto';
import { DistributionQueryDto } from './dto/distribution-query.dto';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * List assessments with filters and pagination.
   */
  async findAll(
    filters: AssessmentFilterDto,
  ): Promise<{ data: Assessment[]; total: number; page: number; limit: number }> {
    const {
      lessonId,
      lessonSessionId,
      learnerId,
      term,
      page = 1,
      limit = 20,
    } = filters;

    const qb = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.lesson', 'lesson');

    if (lessonId) {
      qb.andWhere('assessment.lessonId = :lessonId', { lessonId });
    }
    if (lessonSessionId) {
      qb.andWhere('assessment.lessonSessionId = :lessonSessionId', { lessonSessionId });
    }
    if (learnerId) {
      qb.andWhere('assessment.learnerId = :learnerId', { learnerId });
    }
    if (term) {
      qb.andWhere('lesson.term = :term', { term });
    }

    qb.orderBy('assessment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Bulk create or update assessments for a lesson session.
   */
  async bulkCreate(
    lessonId: string,
    lessonSessionId: string,
    assessments: AssessmentItemDto[],
  ): Promise<Assessment[]> {
    const now = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results: Assessment[] = [];

      for (const item of assessments) {
        const existing = await queryRunner.manager.findOne(Assessment, {
          where: {
            learnerId: item.learnerId,
            lessonSessionId,
          },
        });

        if (existing) {
          existing.score = item.score;
          existing.savedAt = now;
          const updated = await queryRunner.manager.save(Assessment, existing);
          results.push(updated);
        } else {
          const created = queryRunner.manager.create(Assessment, {
            learnerId: item.learnerId,
            lessonId,
            lessonSessionId,
            score: item.score,
            savedAt: now,
          });
          const saved = await queryRunner.manager.save(Assessment, created);
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
   * Get all assessments for a lesson session with learner details.
   */
  async findBySession(sessionId: string): Promise<Assessment[]> {
    return this.assessmentRepository.find({
      where: { lessonSessionId: sessionId },
      relations: ['learner'],
    });
  }

  /**
   * Assessment history for a specific learner.
   */
  async findByLearner(learnerId: string, term?: string): Promise<Assessment[]> {
    const qb = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.lesson', 'lesson')
      .where('assessment.learnerId = :learnerId', { learnerId });

    if (term) {
      qb.andWhere('lesson.term = :term', { term });
    }

    qb.orderBy('assessment.createdAt', 'DESC');

    return qb.getMany();
  }

  /**
   * Assessment distribution for school portal chart.
   * Score 1 = Emerging, Score 2 = Developing, Score 3 or 4 = Secure.
   */
  async getDistribution(
    query: DistributionQueryDto,
  ): Promise<{ emerging: number; developing: number; secure: number; total: number }> {
    const { schoolId, term } = query;

    const qb = this.dataSource
      .createQueryBuilder()
      .select(
        "SUM(CASE WHEN a.score = 1 THEN 1 ELSE 0 END)",
        'emerging',
      )
      .addSelect(
        "SUM(CASE WHEN a.score = 2 THEN 1 ELSE 0 END)",
        'developing',
      )
      .addSelect(
        "SUM(CASE WHEN a.score IN (3, 4) THEN 1 ELSE 0 END)",
        'secure',
      )
      .addSelect('COUNT(*)', 'total')
      .from(Assessment, 'a')
      .innerJoin('lessons', 'l', 'l.id = a.lessonId');

    if (schoolId) {
      // A lesson belongs to a unit, not a class, so it carries no schoolId.
      // The only path from an assessment to a school is through the session it
      // was recorded in: assessment -> lesson_session -> class -> school.
      qb.innerJoin('lesson_sessions', 'ls', 'ls.id = a.lessonSessionId')
        .innerJoin('classes', 'c', 'c.id = ls.classId')
        .andWhere('c.schoolId = :schoolId', { schoolId });
    }

    if (term) {
      qb.andWhere('l.term = :term', { term });
    }

    const row = await qb.getRawOne();

    return {
      emerging: parseInt(row?.emerging ?? '0', 10),
      developing: parseInt(row?.developing ?? '0', 10),
      secure: parseInt(row?.secure ?? '0', 10),
      total: parseInt(row?.total ?? '0', 10),
    };
  }
}
