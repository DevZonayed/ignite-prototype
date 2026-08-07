import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
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
  ): Promise<{ data: Class[]; total: number; page: number; limit: number }> {
    const { schoolId, teacherId, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<Class> = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (teacherId) {
      where.teacherId = teacherId;
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
   * Returns users with the same schoolId as the class and role='learner'.
   */
  async getLearners(id: string): Promise<User[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    return this.userRepository.find({
      where: {
        schoolId: classEntity.schoolId,
        role: UserRole.LEARNER,
      },
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
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
