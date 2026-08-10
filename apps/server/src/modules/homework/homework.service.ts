import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, LessThanOrEqual, MoreThan } from 'typeorm';

import { Homework, HomeworkStatus } from '../../database/entities/homework.entity';
import { HomeworkSubmission, ReviewStatus } from '../../database/entities/homework-submission.entity';
import { HomeworkMessage } from '../../database/entities/homework-message.entity';
import { ParentChild } from '../../database/entities/parent-child.entity';
import { Class } from '../../database/entities/class.entity';
import { User } from '../../database/entities/user.entity';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { HomeworkFilterDto } from './dto/homework-filter.dto';
import { SubmissionFilterDto } from './dto/submission-filter.dto';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    @InjectRepository(HomeworkSubmission)
    private readonly submissionRepository: Repository<HomeworkSubmission>,
    @InjectRepository(HomeworkMessage)
    private readonly messageRepository: Repository<HomeworkMessage>,
    @InjectRepository(ParentChild)
    private readonly parentChildRepository: Repository<ParentChild>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** Class ids belonging to one school — the unit of tenancy for homework. */
  private async classIdsForSchool(schoolId?: string): Promise<string[]> {
    if (!schoolId) return [];
    const classes = await this.classRepository.find({
      where: { schoolId },
      select: ['id'],
    });
    return classes.map((c) => c.id);
  }

  /**
   * List homework with pagination and optional filters.
   * Scoped by user role: teacher sees their classes, parent sees child's homework.
   */
  async findAll(
    filters: HomeworkFilterDto,
    currentUser: any,
  ): Promise<{ data: Homework[]; total: number; page: number; limit: number }> {
    const { classId, status, term, childId, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<Homework> = {};

    if (classId) {
      where.classId = classId;
    }
    if (status) {
      where.status = status;
    }

    // Role-based scoping.
    //
    // Every branch below must narrow `where.classId`, because homework carries
    // no schoolId of its own — the school is only reachable through the class.
    // A role that falls through this block unscoped reads *every school's*
    // homework, which is how a principal came to see another school's rows.
    if (currentUser.role === 'teacher') {
      // TODO: For more precise filtering, join through Class entity where teacherId = currentUser.id.
      // For now, filter by classes assigned to this teacher.
      const teacherClasses = await this.classRepository.find({
        where: { teacherId: currentUser.id },
        select: ['id'],
      });
      const teacherClassIds = teacherClasses.map((c) => c.id);
      if (teacherClassIds.length > 0) {
        where.classId = classId && teacherClassIds.includes(classId)
          ? classId
          : In(teacherClassIds);
      } else {
        // Teacher has no classes — return empty
        return { data: [], total: 0, page, limit };
      }
    } else if (currentUser.role === 'parent') {
      // Parent sees homework for their children
      const targetChildId = childId;
      const parentLinks = await this.parentChildRepository.find({
        where: { parentId: currentUser.id },
      });
      const childIds = parentLinks.map((link) => link.childId);

      if (childIds.length === 0) {
        return { data: [], total: 0, page, limit };
      }

      // If a specific childId is provided, validate it belongs to this parent
      if (targetChildId) {
        if (!childIds.includes(targetChildId)) {
          throw new ForbiddenException('You do not have access to this child\'s homework');
        }
      }

      // Parents see published homework for the classes their children are in.
      const children = await this.userRepository.find({
        where: { id: In(targetChildId ? [targetChildId] : childIds) },
        select: ['id', 'classId'],
      });
      const childClassIds = children
        .map((c) => c.classId)
        .filter((id): id is string => !!id);

      if (childClassIds.length === 0) {
        return { data: [], total: 0, page, limit };
      }

      where.status = HomeworkStatus.PUBLISHED;
      where.classId =
        classId && childClassIds.includes(classId) ? classId : In(childClassIds);
    } else if (currentUser.role === 'learner') {
      // A learner sees published homework for their own class only.
      const learner = await this.userRepository.findOne({
        where: { id: currentUser.id },
        select: ['id', 'classId'],
      });
      if (!learner?.classId) {
        return { data: [], total: 0, page, limit };
      }
      if (classId && classId !== learner.classId) {
        throw new ForbiddenException('You are not enrolled in this class');
      }
      where.status = HomeworkStatus.PUBLISHED;
      where.classId = learner.classId;
    } else if (currentUser.role === 'principal') {
      // A principal sees only their own school's classes.
      const schoolClassIds = await this.classIdsForSchool(currentUser.schoolId);
      if (schoolClassIds.length === 0) {
        return { data: [], total: 0, page, limit };
      }
      if (classId && !schoolClassIds.includes(classId)) {
        throw new ForbiddenException('This class belongs to another school');
      }
      where.classId = classId || In(schoolClassIds);
    } else if (
      currentUser.role !== 'platform_admin' &&
      currentUser.role !== 'curriculum_admin'
    ) {
      // Unknown role: deny by default rather than leak the whole table.
      return { data: [], total: 0, page, limit };
    }

    const [data, total] = await this.homeworkRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new homework assignment (teacher only).
   */
  async create(dto: CreateHomeworkDto): Promise<Homework> {
    const homework = this.homeworkRepository.create({
      ...dto,
      status: dto.status || HomeworkStatus.DRAFT,
      publishedAt: dto.status === HomeworkStatus.PUBLISHED ? new Date() : undefined,
    } as any);

    return this.homeworkRepository.save(homework) as unknown as Promise<Homework>;
  }

  /**
   * Get homework detail with submission stats.
   */
  async findById(id: string): Promise<Homework & { stats: { totalSubmissions: number; pending: number; reviewed: number } }> {
    const homework = await this.homeworkRepository.findOne({ where: { id } });
    if (!homework) {
      throw new NotFoundException(`Homework with ID "${id}" not found`);
    }

    const totalSubmissions = await this.submissionRepository.count({
      where: { homeworkId: id },
    });
    const pending = await this.submissionRepository.count({
      where: { homeworkId: id, reviewStatus: ReviewStatus.PENDING },
    });
    const reviewed = await this.submissionRepository.count({
      where: { homeworkId: id, reviewStatus: ReviewStatus.REVIEWED },
    });

    return {
      ...homework,
      stats: { totalSubmissions, pending, reviewed },
    };
  }

  /**
   * Update an existing homework assignment.
   */
  async update(id: string, dto: UpdateHomeworkDto): Promise<Homework> {
    const homework = await this.homeworkRepository.findOne({ where: { id } });
    if (!homework) {
      throw new NotFoundException(`Homework with ID "${id}" not found`);
    }

    // If status is being changed to published, set publishedAt
    if (dto.status === HomeworkStatus.PUBLISHED && homework.status === HomeworkStatus.DRAFT) {
      (dto as any).publishedAt = new Date();
    }

    Object.assign(homework, dto);
    return this.homeworkRepository.save(homework);
  }

  /**
   * Delete a homework assignment (only drafts can be deleted).
   */
  async remove(id: string): Promise<void> {
    const homework = await this.homeworkRepository.findOne({ where: { id } });
    if (!homework) {
      throw new NotFoundException(`Homework with ID "${id}" not found`);
    }

    if (homework.status !== HomeworkStatus.DRAFT) {
      throw new BadRequestException('Only draft homework can be deleted');
    }

    await this.homeworkRepository.remove(homework);
  }

  /**
   * List submissions for a homework with optional review status filter.
   */
  async findSubmissions(
    homeworkId: string,
    filters: SubmissionFilterDto,
  ): Promise<{ data: HomeworkSubmission[]; total: number; page: number; limit: number }> {
    const homework = await this.homeworkRepository.findOne({ where: { id: homeworkId } });
    if (!homework) {
      throw new NotFoundException(`Homework with ID "${homeworkId}" not found`);
    }

    const { reviewStatus, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<HomeworkSubmission> = { homeworkId };
    if (reviewStatus) {
      where.reviewStatus = reviewStatus;
    }

    const [data, total] = await this.submissionRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['learner'],
    });

    return { data, total, page, limit };
  }

  /**
   * Get a single submission detail with files and messages.
   */
  async findSubmissionById(submissionId: string): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['homework', 'learner', 'messages'],
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }
    return submission;
  }

  /**
   * Create a submission (parent uploads on behalf of child).
   */
  async createSubmission(homeworkId: string, dto: CreateSubmissionDto): Promise<HomeworkSubmission> {
    const homework = await this.homeworkRepository.findOne({ where: { id: homeworkId } });
    if (!homework) {
      throw new NotFoundException(`Homework with ID "${homeworkId}" not found`);
    }

    const submission = this.submissionRepository.create({
      ...dto,
      homeworkId,
      submittedAt: new Date(),
      reviewStatus: ReviewStatus.PENDING,
    });

    return this.submissionRepository.save(submission);
  }

  /**
   * Update a submission (e.g. add file).
   */
  async updateSubmission(
    submissionId: string,
    dto: Partial<CreateSubmissionDto>,
  ): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }

    Object.assign(submission, dto);
    return this.submissionRepository.save(submission);
  }

  /**
   * Publish teacher feedback on a submission.
   * Sets reviewStatus to reviewed and feedbackPublishedAt to now.
   */
  async publishFeedback(submissionId: string): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }

    submission.reviewStatus = ReviewStatus.REVIEWED;
    submission.feedbackPublishedAt = new Date();

    return this.submissionRepository.save(submission);
  }

  /**
   * Get message thread for a submission, sorted by createdAt ascending.
   */
  async findMessages(submissionId: string): Promise<HomeworkMessage[]> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }

    return this.messageRepository.find({
      where: { submissionId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Send a message on a submission thread.
   */
  async createMessage(
    submissionId: string,
    dto: CreateMessageDto,
  ): Promise<HomeworkMessage> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }

    const message = this.messageRepository.create({
      ...dto,
      submissionId,
    });

    return this.messageRepository.save(message);
  }

  /**
   * Per-class compliance breakdown.
   * Returns stats: className, totalHomework, totalSubmissions, pendingCount, lateCount, onTimeCount, onTimePercent.
   */
  async getCompliance(
    schoolId?: string,
    term?: string,
  ): Promise<any[]> {
    // Find classes, optionally filtered by school
    const classWhere: FindOptionsWhere<Class> = {};
    if (schoolId) {
      classWhere.schoolId = schoolId;
    }

    const classes = await this.classRepository.find({ where: classWhere });

    const results: any[] = [];

    for (const cls of classes) {
      const homeworkWhere: FindOptionsWhere<Homework> = { classId: cls.id };

      const homeworks = await this.homeworkRepository.find({ where: homeworkWhere });
      const homeworkIds = homeworks.map((h) => h.id);

      if (homeworkIds.length === 0) {
        results.push({
          className: cls.name,
          totalHomework: 0,
          totalSubmissions: 0,
          pendingCount: 0,
          lateCount: 0,
          onTimeCount: 0,
          onTimePercent: 0,
        });
        continue;
      }

      const submissions = await this.submissionRepository.find({
        where: { homeworkId: In(homeworkIds) },
        relations: ['homework'],
      });

      // Compute pending: total assigned learners minus submissions count
      // For simplicity, use learnerCount from the class entity
      const totalAssigned = cls.learnerCount * homeworks.length;
      const totalSubmissions = submissions.length;
      const pendingCount = Math.max(0, totalAssigned - totalSubmissions);

      let lateCount = 0;
      let onTimeCount = 0;

      for (const sub of submissions) {
        const homework = sub.homework || homeworks.find((h) => h.id === sub.homeworkId);
        if (homework && homework.dueDate && sub.submittedAt) {
          const dueDate = new Date(homework.dueDate);
          const submittedAt = new Date(sub.submittedAt);
          if (submittedAt > dueDate) {
            lateCount++;
          } else {
            onTimeCount++;
          }
        } else {
          // No due date set — count as on time
          onTimeCount++;
        }
      }

      const onTimePercent =
        totalSubmissions > 0 ? Math.round((onTimeCount / totalSubmissions) * 100) : 0;

      results.push({
        className: cls.name,
        totalHomework: homeworks.length,
        totalSubmissions,
        pendingCount,
        lateCount,
        onTimeCount,
        onTimePercent,
      });
    }

    return results;
  }

  /**
   * Send bulk reminders to parents of learners with pending/late submissions.
   * Returns the count of reminders queued (actual sending handled by notification module).
   */
  async sendReminders(homeworkId: string): Promise<{ remindersQueued: number }> {
    const homework = await this.homeworkRepository.findOne({ where: { id: homeworkId } });
    if (!homework) {
      throw new NotFoundException(`Homework with ID "${homeworkId}" not found`);
    }

    // Find learners who have submitted
    const submissions = await this.submissionRepository.find({
      where: { homeworkId },
      select: ['learnerId'],
    });
    const submittedLearnerIds = submissions.map((s) => s.learnerId);

    // Find parent-child links for learners who have NOT submitted or whose submission is pending/late
    // For simplicity, find all parent links for learners in the class who haven't submitted
    // TODO: Filter by class enrollment to get only learners assigned to this homework's class
    const pendingSubmissions = await this.submissionRepository.find({
      where: { homeworkId, reviewStatus: ReviewStatus.PENDING },
      select: ['learnerId'],
    });
    const pendingLearnerIds = pendingSubmissions.map((s) => s.learnerId);

    // Find parents of pending learners
    let remindersQueued = 0;
    if (pendingLearnerIds.length > 0) {
      const parentLinks = await this.parentChildRepository.find({
        where: { childId: In(pendingLearnerIds) },
      });
      remindersQueued = parentLinks.length;
    }

    // TODO: Dispatch actual notifications via a notification module

    return { remindersQueued };
  }
}
