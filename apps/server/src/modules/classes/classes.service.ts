import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  In,
  IsNull,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { Class } from '../../database/entities/class.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { Attendance, AttendanceStatus } from '../../database/entities/attendance.entity';
import { School } from '../../database/entities/school.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassFilterDto } from './dto/class-filter.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  /**
   * List classes with optional filters and pagination.
   */
  async findAll(
    filters: ClassFilterDto,
    currentUser?: any,
  ): Promise<{ data: Class[]; total: number; page: number; limit: number }> {
    const { schoolId, teacherId, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<Class> = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (teacherId) {
      where.teacherId = teacherId;
    }

    // Tenancy. The teacher app calls `GET /classes` with no filter at all, and
    // with none applied here that returned every class on the platform — a
    // teacher saw other schools' classes, and the home screen picked one of
    // them as the "active" class. Narrow by role before querying.
    if (currentUser?.role === 'teacher') {
      where.teacherId = currentUser.id;
    } else if (currentUser?.role === 'principal') {
      if (!currentUser.schoolId) {
        return { data: [], total: 0, page, limit };
      }
      if (schoolId && schoolId !== currentUser.schoolId) {
        throw new ForbiddenException('That school is not yours');
      }
      where.schoolId = currentUser.schoolId;
    }

    const [data, total] = await this.classRepository.findAndCount({
      where,
      relations: ['teacher'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new class.
   */
  async create(dto: CreateClassDto): Promise<Class> {
    const school = await this.schoolRepository.findOne({
      where: { id: dto.schoolId },
    });
    if (!school) {
      throw new NotFoundException(
        `School with ID "${dto.schoolId}" not found`,
      );
    }

    if (dto.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: dto.teacherId },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID "${dto.teacherId}" not found`,
        );
      }
    }

    const classEntity = this.classRepository.create(dto);
    return this.classRepository.save(classEntity);
  }

  /**
   * Find a class by ID with school and teacher relations.
   */
  async findById(id: string): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['school', 'teacher'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    return classEntity;
  }

  /**
   * Update an existing class.
   */
  async update(id: string, dto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    if (dto.schoolId && dto.schoolId !== classEntity.schoolId) {
      const school = await this.schoolRepository.findOne({
        where: { id: dto.schoolId },
      });
      if (!school) {
        throw new NotFoundException(
          `School with ID "${dto.schoolId}" not found`,
        );
      }
    }

    if (dto.teacherId && dto.teacherId !== classEntity.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: dto.teacherId },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID "${dto.teacherId}" not found`,
        );
      }
    }

    Object.assign(classEntity, dto);
    return this.classRepository.save(classEntity);
  }

  /**
   * Get learners enrolled in a class.
   *
   * This used to match on `schoolId` alone, so every class in a school returned
   * the same roster and no register could be class-specific. It now reads the
   * enrolment itself.
   */
  async getLearners(id: string): Promise<User[]> {
    await this.findOrFail(id);

    return this.userRepository.find({
      where: { classId: id, role: UserRole.LEARNER },
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  /**
   * Learners at the class's school who are not yet on any register — the
   * candidate list a principal picks from when enrolling.
   */
  async getEnrollableLearners(id: string): Promise<User[]> {
    const classEntity = await this.findOrFail(id);

    return this.userRepository.find({
      where: {
        schoolId: classEntity.schoolId,
        role: UserRole.LEARNER,
        classId: IsNull(),
      },
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  /**
   * Enrol learners into a class.
   *
   * A learner belongs to exactly one class, so this moves them if they were
   * already on another register. Cross-school moves are refused: a class only
   * ever holds learners from its own school.
   */
  async enrolLearners(id: string, learnerIds: string[]): Promise<User[]> {
    const classEntity = await this.findOrFail(id);

    const learners = await this.userRepository.find({
      where: { id: In(learnerIds) },
    });

    const missing = learnerIds.filter(
      (learnerId) => !learners.some((l) => l.id === learnerId),
    );
    if (missing.length) {
      throw new NotFoundException(`Learner(s) not found: ${missing.join(', ')}`);
    }

    for (const learner of learners) {
      if (learner.role !== UserRole.LEARNER) {
        throw new BadRequestException(
          `User "${learner.id}" is a ${learner.role}, not a learner`,
        );
      }
      if (learner.schoolId !== classEntity.schoolId) {
        throw new BadRequestException(
          `Learner "${learner.id}" belongs to a different school`,
        );
      }
    }

    const previousClassIds = new Set(
      learners.map((l) => l.classId).filter((c): c is string => !!c),
    );

    await this.userRepository.update(
      { id: In(learnerIds) },
      { classId: id },
    );

    await this.refreshLearnerCounts([id, ...previousClassIds]);

    return this.getLearners(id);
  }

  /** Remove one learner from a class register. */
  async unenrolLearner(id: string, learnerId: string): Promise<User[]> {
    await this.findOrFail(id);

    const learner = await this.userRepository.findOne({
      where: { id: learnerId },
    });
    if (!learner) {
      throw new NotFoundException(`Learner with ID "${learnerId}" not found`);
    }
    if (learner.classId !== id) {
      throw new BadRequestException('That learner is not in this class');
    }

    learner.classId = null;
    await this.userRepository.save(learner);
    await this.refreshLearnerCounts([id]);

    return this.getLearners(id);
  }

  /**
   * Recount `learnerCount` from the register itself.
   *
   * The column is a cache for list views; deriving it here means it can never
   * drift from the enrolments the way a hand-maintained counter would.
   */
  private async refreshLearnerCounts(classIds: string[]): Promise<void> {
    for (const classId of new Set(classIds)) {
      const learnerCount = await this.userRepository.count({
        where: { classId, role: UserRole.LEARNER },
      });
      await this.classRepository.update({ id: classId }, { learnerCount });
    }
  }

  private async findOrFail(id: string): Promise<Class> {
    const classEntity = await this.classRepository.findOne({ where: { id } });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }
    return classEntity;
  }

  /**
   * Get attendance heatmap for a class over the last 4 weeks.
   */
  async getAttendanceHeatmap(id: string): Promise<{
    classId: string;
    className: string;
    heatmap: {
      date: string;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      total: number;
    }[];
  }> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    // Calculate date 4 weeks ago
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const startDate = fourWeeksAgo.toISOString().split('T')[0];

    const records = await this.attendanceRepository.find({
      where: {
        classId: id,
        date: MoreThanOrEqual(startDate),
      },
      order: { date: 'ASC' },
    });

    // Group by date and compute counts
    const dateMap = new Map<
      string,
      { presentCount: number; absentCount: number; lateCount: number; total: number }
    >();

    for (const record of records) {
      const dateKey = typeof record.date === 'string'
        ? record.date
        : new Date(record.date).toISOString().split('T')[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          total: 0,
        });
      }

      const entry = dateMap.get(dateKey)!;
      entry.total += 1;

      if (record.status === AttendanceStatus.PRESENT) {
        entry.presentCount += 1;
      } else if (record.status === AttendanceStatus.ABSENT) {
        entry.absentCount += 1;
      } else if (record.status === AttendanceStatus.LATE) {
        entry.lateCount += 1;
      }
    }

    const heatmap = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    return {
      classId: classEntity.id,
      className: classEntity.name,
      heatmap,
    };
  }
}
