import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { Lesson, LessonStatus } from '../../database/entities/lesson.entity';
import { LessonMedia } from '../../database/entities/lesson-media.entity';
import { LessonStep } from '../../database/entities/lesson-step.entity';
import { LessonActivity } from '../../database/entities/lesson-activity.entity';
import { Unit } from '../../database/entities/unit.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateLessonMediaDto } from './dto/create-lesson-media.dto';
import { LessonFilterDto } from './dto/lesson-filter.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(LessonMedia)
    private readonly lessonMediaRepository: Repository<LessonMedia>,
    @InjectRepository(LessonStep)
    private readonly lessonStepsRepository: Repository<LessonStep>,
    @InjectRepository(LessonActivity)
    private readonly lessonActivitiesRepository: Repository<LessonActivity>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  /**
   * List lessons with pagination and optional filters.
   */
  async findAll(
    filters: LessonFilterDto,
  ): Promise<{ data: Lesson[]; total: number; page: number; limit: number }> {
    const { unitId, status, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<Lesson> = {};

    if (unitId) {
      where.unitId = unitId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.lessonsRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { order: 'ASC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new lesson within a unit (verifying the unit belongs to the curriculum).
   */
  async create(
    curriculumId: string,
    unitId: string,
    dto: CreateLessonDto,
  ): Promise<Lesson> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId } });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${unitId}" not found`);
    }

    if (unit.curriculumVersionId !== curriculumId) {
      throw new BadRequestException(
        `Unit "${unitId}" does not belong to curriculum "${curriculumId}"`,
      );
    }

    const lesson = this.lessonsRepository.create({
      ...dto,
      unitId,
    });

    return this.lessonsRepository.save(lesson);
  }

  /**
   * Get full lesson detail with all relations.
   */
  async findById(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['media', 'steps', 'activities'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }

    return lesson;
  }

  /**
   * Update a lesson (any fields).
   */
  async update(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findById(id);
    Object.assign(lesson, dto);
    return this.lessonsRepository.save(lesson);
  }

  /**
   * Update lesson status only.
   */
  async updateStatus(id: string, status: LessonStatus): Promise<Lesson> {
    const lesson = await this.findById(id);
    lesson.status = status;
    return this.lessonsRepository.save(lesson);
  }

  /**
   * Add media to a lesson.
   */
  async addMedia(lessonId: string, dto: CreateLessonMediaDto): Promise<LessonMedia> {
    // Verify the lesson exists
    await this.findById(lessonId);

    const media = this.lessonMediaRepository.create({
      ...dto,
      lessonId,
    });

    return this.lessonMediaRepository.save(media);
  }

  /**
   * Remove media from a lesson.
   */
  async removeMedia(lessonId: string, mediaId: string): Promise<void> {
    const media = await this.lessonMediaRepository.findOne({
      where: { id: mediaId, lessonId },
    });

    if (!media) {
      throw new NotFoundException(
        `Media with ID "${mediaId}" not found for lesson "${lessonId}"`,
      );
    }

    await this.lessonMediaRepository.remove(media);
  }

  /**
   * Get lesson media grouped by category.
   */
  async getMedia(
    lessonId: string,
  ): Promise<Record<string, LessonMedia[]>> {
    // Verify the lesson exists
    await this.findById(lessonId);

    const media = await this.lessonMediaRepository.find({
      where: { lessonId },
      order: { order: 'ASC' },
    });

    const grouped: Record<string, LessonMedia[]> = {};
    for (const item of media) {
      const key = item.category || 'uncategorised';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    }

    return grouped;
  }

  /**
   * Get lesson steps ordered by stepNumber.
   */
  async getSteps(lessonId: string): Promise<LessonStep[]> {
    // Verify the lesson exists
    await this.findById(lessonId);

    return this.lessonStepsRepository.find({
      where: { lessonId },
      order: { stepNumber: 'ASC' },
    });
  }

  /**
   * Get lesson activities ordered by orderIndex.
   */
  async getActivities(lessonId: string): Promise<LessonActivity[]> {
    // Verify the lesson exists
    await this.findById(lessonId);

    return this.lessonActivitiesRepository.find({
      where: { lessonId },
      order: { orderIndex: 'ASC' },
    });
  }

  /**
   * Toggle activity completion. Since the LessonActivity entity does not have
   * a `completed` field, this endpoint updates the title to reflect the toggle
   * (prefixing/removing a check mark) as a graceful fallback.
   */
  async toggleActivity(
    lessonId: string,
    activityId: string,
  ): Promise<LessonActivity> {
    const activity = await this.lessonActivitiesRepository.findOne({
      where: { id: activityId, lessonId },
    });

    if (!activity) {
      throw new NotFoundException(
        `Activity with ID "${activityId}" not found for lesson "${lessonId}"`,
      );
    }

    // Toggle by prefixing/removing a checkmark indicator
    const completedPrefix = '[x] ';
    if (activity.title.startsWith(completedPrefix)) {
      activity.title = activity.title.slice(completedPrefix.length);
    } else {
      activity.title = completedPrefix + activity.title;
    }

    return this.lessonActivitiesRepository.save(activity);
  }
}
