import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  In,
  MoreThanOrEqual,
  Between,
} from 'typeorm';

import { School } from '../../database/entities/school.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { Class } from '../../database/entities/class.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { Attendance, AttendanceStatus } from '../../database/entities/attendance.entity';
import { Evidence } from '../../database/entities/evidence.entity';
import { MediaLibrary } from '../../database/entities/media-library.entity';
import { Project } from '../../database/entities/project.entity';
import { CurriculumVersion } from '../../database/entities/curriculum-version.entity';
import { Unit } from '../../database/entities/unit.entity';
import { Lesson, LessonStatus } from '../../database/entities/lesson.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolFilterDto } from './dto/school-filter.dto';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,

    @InjectRepository(MediaLibrary)
    private readonly mediaLibraryRepository: Repository<MediaLibrary>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(CurriculumVersion)
    private readonly curriculumVersionRepository: Repository<CurriculumVersion>,

    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  /**
   * List schools with pagination and optional filters.
   */
  async findAll(
    filters: SchoolFilterDto,
  ): Promise<{ data: School[]; total: number; page: number; limit: number }> {
    const { region, status, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<School> = {};

    if (region) {
      where.region = region;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.schoolRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new school. Throws ConflictException if a school with the same name already exists.
   */
  async create(dto: CreateSchoolDto): Promise<School> {
    const existing = await this.schoolRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        `A school with the name "${dto.name}" already exists`,
      );
    }

    const school = this.schoolRepository.create(dto);
    return this.schoolRepository.save(school);
  }

  /**
   * Find a school by ID with related data.
   */
  async findById(id: string): Promise<School> {
    const school = await this.schoolRepository.findOne({
      where: { id },
      relations: ['classes', 'curriculumVersion'],
    });

    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    return school;
  }

  /**
   * Update a school by ID.
   */
  async update(id: string, dto: UpdateSchoolDto): Promise<School> {
    const school = await this.schoolRepository.findOne({ where: { id } });

    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    if (dto.name && dto.name !== school.name) {
      const existing = await this.schoolRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          `A school with the name "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(school, dto);
    return this.schoolRepository.save(school);
  }

  /**
   * Compute comprehensive dashboard statistics for a school.
   */
  async getDashboard(id: string) {
    const school = await this.schoolRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    // Get classes for this school
    const classes = await this.classRepository.find({
      where: { schoolId: id },
    });
    const classIds = classes.map((c) => c.id);

    // Teacher and learner counts
    const teacherCount = await this.userRepository.count({
      where: { schoolId: id, role: UserRole.TEACHER },
    });

    const learnerCount = await this.userRepository.count({
      where: { schoolId: id, role: UserRole.LEARNER },
    });

    // Lessons today: count lesson sessions started today for classes belonging to this school
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let lessonsToday = 0;
    if (classIds.length > 0) {
      lessonsToday = await this.lessonSessionRepository.count({
        where: {
          classId: In(classIds),
          startedAt: Between(todayStart, todayEnd),
        },
      });
    }

    // Media uploaded: count media library items linked to units in this school's curriculum
    let mediaUploaded = 0;
    if (school.curriculumVersionId) {
      const units = await this.unitRepository.find({
        where: { curriculumVersionId: school.curriculumVersionId },
      });
      const unitIds = units.map((u) => u.id);
      if (unitIds.length > 0) {
        mediaUploaded = await this.mediaLibraryRepository.count({
          where: { unitId: In(unitIds) },
        });
      }
    }

    // Projects completed: count projects by learners who belong to this school
    const schoolLearners = await this.userRepository.find({
      where: { schoolId: id, role: UserRole.LEARNER },
      select: ['id'],
    });
    const learnerIds = schoolLearners.map((l) => l.id);

    let projectsCompleted = 0;
    if (learnerIds.length > 0) {
      projectsCompleted = await this.projectRepository.count({
        where: { learnerId: In(learnerIds) },
      });
    }

    // Curriculum completion percent: lessons with status 'done' vs total lessons
    let curriculumCompletionPercent = 0;
    if (school.curriculumVersionId) {
      const units = await this.unitRepository.find({
        where: { curriculumVersionId: school.curriculumVersionId },
        select: ['id'],
      });
      const unitIds = units.map((u) => u.id);

      if (unitIds.length > 0) {
        const totalLessons = await this.lessonRepository.count({
          where: { unitId: In(unitIds) },
        });
        const doneLessons = await this.lessonRepository.count({
          where: { unitId: In(unitIds), status: LessonStatus.DONE },
        });

        curriculumCompletionPercent =
          totalLessons > 0
            ? Math.round((doneLessons / totalLessons) * 100)
            : 0;
      }
    }

    // Learner engagement percent: attendance records (present / total) for classes in this school
    let learnerEngagementPercent = 0;
    if (classIds.length > 0) {
      const totalAttendance = await this.attendanceRepository.count({
        where: { classId: In(classIds) },
      });
      const presentAttendance = await this.attendanceRepository.count({
        where: {
          classId: In(classIds),
          status: AttendanceStatus.PRESENT,
        },
      });

      learnerEngagementPercent =
        totalAttendance > 0
          ? Math.round((presentAttendance / totalAttendance) * 100)
          : 0;
    }

    // Attendance trend: last 7 days
    const attendanceTrend: {
      date: string;
      presentCount: number;
      totalCount: number;
    }[] = [];

    if (classIds.length > 0) {
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dateStr = day.toISOString().split('T')[0];

        const totalCount = await this.attendanceRepository.count({
          where: { classId: In(classIds), date: dateStr },
        });
        const presentCount = await this.attendanceRepository.count({
          where: {
            classId: In(classIds),
            date: dateStr,
            status: AttendanceStatus.PRESENT,
          },
        });

        attendanceTrend.push({ date: dateStr, presentCount, totalCount });
      }
    }

    // Coverage by grade: group classes by gradeLevel and average their curriculumCoveragePercent
    const coverageByGrade: {
      gradeLevel: string;
      averageCoveragePercent: number;
    }[] = [];

    if (classes.length > 0) {
      const gradeMap = new Map<string, number[]>();
      for (const cls of classes) {
        const grade = cls.gradeLevel || 'Unknown';
        if (!gradeMap.has(grade)) {
          gradeMap.set(grade, []);
        }
        gradeMap.get(grade)!.push(Number(cls.curriculumCoveragePercent) || 0);
      }

      for (const [gradeLevel, coverages] of gradeMap) {
        const sum = coverages.reduce((a, b) => a + b, 0);
        const averageCoveragePercent = Math.round(sum / coverages.length);
        coverageByGrade.push({ gradeLevel, averageCoveragePercent });
      }
    }

    // Teacher activity: for each teacher at this school, get lessons this week and last active
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const teachers = await this.userRepository.find({
      where: { schoolId: id, role: UserRole.TEACHER },
    });

    const teacherActivity: {
      teacherId: string;
      teacherName: string;
      lessonsThisWeek: number;
      lastActive: Date | null;
    }[] = [];

    for (const teacher of teachers) {
      let lessonsThisWeek = 0;
      if (classIds.length > 0) {
        lessonsThisWeek = await this.lessonSessionRepository.count({
          where: {
            teacherId: teacher.id,
            classId: In(classIds),
            startedAt: MoreThanOrEqual(weekStart),
          },
        });
      }

      teacherActivity.push({
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        lessonsThisWeek,
        lastActive: teacher.lastLoginAt || null,
      });
    }

    // Needs attention alerts
    const needsAttentionAlerts: string[] = [];

    // Check for teachers who haven't logged in for 7+ days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveTeachers = teachers.filter(
      (t) => !t.lastLoginAt || new Date(t.lastLoginAt) < sevenDaysAgo,
    );
    if (inactiveTeachers.length > 0) {
      needsAttentionAlerts.push(
        `${inactiveTeachers.length} teacher${inactiveTeachers.length > 1 ? 's have' : ' has'} not logged in for 7 days`,
      );
    }

    // Check for grades with coverage below 30%
    for (const grade of coverageByGrade) {
      if (grade.averageCoveragePercent < 30) {
        needsAttentionAlerts.push(
          `${grade.gradeLevel} curriculum coverage is below 30%`,
        );
      }
    }

    return {
      schoolId: id,
      schoolName: school.name,
      teacherCount,
      learnerCount,
      lessonsToday,
      mediaUploaded,
      projectsCompleted,
      curriculumCompletionPercent,
      learnerEngagementPercent,
      attendanceTrend,
      coverageByGrade,
      teacherActivity,
      needsAttentionAlerts,
    };
  }

  /**
   * List users belonging to a school.
   */
  async getUsers(id: string): Promise<User[]> {
    const school = await this.schoolRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    return this.userRepository.find({
      where: { schoolId: id },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get school settings.
   */
  async getSettings(id: string) {
    const school = await this.schoolRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    return {
      timezone: school.timezone,
      academicYear: school.academicYear,
      currentTerm: school.currentTerm,
      subject: school.subject,
      aiCapUsedPercent: school.aiCapUsedPercent,
    };
  }

  /**
   * Update school settings fields only.
   */
  async updateSettings(id: string, settings: Partial<School>) {
    const school = await this.schoolRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    // Only allow settings-related fields to be updated
    const allowedFields = [
      'timezone',
      'academicYear',
      'currentTerm',
      'subject',
      'aiCapUsedPercent',
    ];

    for (const key of allowedFields) {
      if (settings[key] !== undefined) {
        (school as any)[key] = settings[key];
      }
    }

    return this.schoolRepository.save(school);
  }
}
