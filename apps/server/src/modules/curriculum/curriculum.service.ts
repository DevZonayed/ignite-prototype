import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  CurriculumVersion,
  CurriculumVersionStatus,
} from '../../database/entities/curriculum-version.entity';
import { Unit } from '../../database/entities/unit.entity';
import { School } from '../../database/entities/school.entity';
import { Lesson, LessonStatus } from '../../database/entities/lesson.entity';
import { Class } from '../../database/entities/class.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AssignCurriculumDto } from './dto/assign-curriculum.dto';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(CurriculumVersion)
    private readonly curriculumVersionRepository: Repository<CurriculumVersion>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,
  ) {}

  /**
   * Curriculum coverage per class: how many lessons have been delivered (have a completed session)
   * out of total lessons in the curriculum, grouped by class.
   */
  async getCoverage(
    schoolId?: string,
  ): Promise<{ className: string; classId: string; totalLessons: number; deliveredLessons: number; coveragePercent: number }[]> {
    const classWhere: Record<string, any> = {};
    if (schoolId) {
      classWhere.schoolId = schoolId;
    }

    const classes = await this.classRepository.find({ where: classWhere });
    const totalLessons = await this.lessonRepository.count();

    const results: { className: string; classId: string; totalLessons: number; deliveredLessons: number; coveragePercent: number }[] = [];

    for (const cls of classes) {
      // Count distinct lessons that have a completed session for this class
      const deliveredCount = await this.lessonSessionRepository
        .createQueryBuilder('ls')
        .select('COUNT(DISTINCT ls.lessonId)', 'count')
        .where('ls.classId = :classId', { classId: cls.id })
        .andWhere('ls.completedAt IS NOT NULL')
        .getRawOne();

      const deliveredLessons = Number(deliveredCount?.count || 0);
      const coveragePercent = totalLessons > 0
        ? Math.round((deliveredLessons / totalLessons) * 100)
        : 0;

      results.push({
        className: cls.name,
        classId: cls.id,
        totalLessons,
        deliveredLessons,
        coveragePercent,
      });
    }

    return results;
  }

  /**
   * List all curriculum versions, ordered by version descending.
   */
  async findAll(): Promise<CurriculumVersion[]> {
    return this.curriculumVersionRepository.find({
      order: { version: 'DESC' },
    });
  }

  /**
   * Create a new draft curriculum version.
   * Auto-sets version to max existing version + 1.
   */
  async create(dto: CreateCurriculumDto): Promise<CurriculumVersion> {
    const maxResult = await this.curriculumVersionRepository
      .createQueryBuilder('cv')
      .select('MAX(cv.version)', 'maxVersion')
      .getRawOne();

    const nextVersion = (maxResult?.maxVersion ?? 0) + 1;

    const curriculum = this.curriculumVersionRepository.create({
      name: dto.name,
      version: nextVersion,
      status: CurriculumVersionStatus.DRAFT,
      isImmutable: false,
    });

    return this.curriculumVersionRepository.save(curriculum);
  }

  /**
   * Find a curriculum version with its full tree: units and their lessons,
   * ordered by unit.order then lesson.order.
   */
  async findById(id: string): Promise<CurriculumVersion> {
    const curriculum = await this.curriculumVersionRepository.findOne({
      where: { id },
      relations: ['units'],
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum version with ID "${id}" not found`,
      );
    }

    // Load lessons for each unit, ordered properly
    if (curriculum.units && curriculum.units.length > 0) {
      curriculum.units.sort((a, b) => a.order - b.order);

      for (const unit of curriculum.units) {
        unit.lessons = await this.lessonRepository.find({
          where: { unitId: unit.id },
          order: { order: 'ASC' },
        });
      }
    }

    return curriculum;
  }

  /**
   * Publish a curriculum version.
   */
  async publish(id: string): Promise<CurriculumVersion> {
    const curriculum = await this.curriculumVersionRepository.findOne({
      where: { id },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum version with ID "${id}" not found`,
      );
    }

    if (curriculum.status === CurriculumVersionStatus.PUBLISHED) {
      throw new ConflictException(
        `Curriculum version "${id}" is already published`,
      );
    }

    curriculum.status = CurriculumVersionStatus.PUBLISHED;
    curriculum.publishedAt = new Date();
    curriculum.isImmutable = true;

    return this.curriculumVersionRepository.save(curriculum);
  }

  /**
   * Assign a published curriculum to one or more schools.
   */
  async assignToSchools(
    id: string,
    dto: AssignCurriculumDto,
  ): Promise<{ assignedCount: number }> {
    const curriculum = await this.curriculumVersionRepository.findOne({
      where: { id },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum version with ID "${id}" not found`,
      );
    }

    if (curriculum.status === CurriculumVersionStatus.DRAFT) {
      throw new ConflictException(
        'Cannot assign a draft curriculum to schools. Publish it first.',
      );
    }

    const result = await this.schoolRepository.update(
      { id: In(dto.schoolIds) },
      { curriculumVersionId: curriculum.id },
    );

    return { assignedCount: result.affected ?? 0 };
  }

  /**
   * Add a unit to a curriculum version.
   */
  async addUnit(curriculumId: string, dto: CreateUnitDto): Promise<Unit> {
    const curriculum = await this.curriculumVersionRepository.findOne({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum version with ID "${curriculumId}" not found`,
      );
    }

    if (curriculum.isImmutable) {
      throw new ConflictException(
        'Cannot add units to an immutable curriculum version',
      );
    }

    const unit = this.unitRepository.create({
      ...dto,
      curriculumVersionId: curriculumId,
    });

    return this.unitRepository.save(unit);
  }

  /**
   * Update a unit within a curriculum version.
   */
  async updateUnit(
    curriculumId: string,
    unitId: string,
    dto: UpdateUnitDto,
  ): Promise<Unit> {
    const curriculum = await this.curriculumVersionRepository.findOne({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum version with ID "${curriculumId}" not found`,
      );
    }

    if (curriculum.isImmutable) {
      throw new ConflictException(
        'Cannot update units in an immutable curriculum version',
      );
    }

    const unit = await this.unitRepository.findOne({
      where: { id: unitId, curriculumVersionId: curriculumId },
    });

    if (!unit) {
      throw new NotFoundException(
        `Unit with ID "${unitId}" not found in curriculum "${curriculumId}"`,
      );
    }

    Object.assign(unit, dto);
    return this.unitRepository.save(unit);
  }

  /**
   * Delete a unit from a curriculum version.
   */
  async deleteUnit(curriculumId: string, unitId: string): Promise<void> {
    const curriculum = await this.curriculumVersionRepository.findOne({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum version with ID "${curriculumId}" not found`,
      );
    }

    if (curriculum.isImmutable) {
      throw new ConflictException(
        'Cannot delete units from an immutable curriculum version',
      );
    }

    const unit = await this.unitRepository.findOne({
      where: { id: unitId, curriculumVersionId: curriculumId },
    });

    if (!unit) {
      throw new NotFoundException(
        `Unit with ID "${unitId}" not found in curriculum "${curriculumId}"`,
      );
    }

    await this.unitRepository.remove(unit);
  }
}
