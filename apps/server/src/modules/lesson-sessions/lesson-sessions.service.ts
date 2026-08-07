import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { LessonSession } from '../../database/entities/lesson-session.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';

@Injectable()
export class LessonSessionsService {
  constructor(
    @InjectRepository(LessonSession)
    private readonly sessionRepository: Repository<LessonSession>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  /**
   * Start a new lesson session for the authenticated teacher.
   * Ensures no other active session exists for this teacher.
   */
  async create(dto: CreateSessionDto, teacherId: string): Promise<LessonSession> {
    // Check for an existing active session (completedAt IS NULL)
    const activeSession = await this.sessionRepository.findOne({
      where: { teacherId, completedAt: IsNull() },
    });

    if (activeSession) {
      throw new ConflictException(
        'You already have an active lesson session. Complete it before starting a new one.',
      );
    }

    // Verify the lesson exists
    const lesson = await this.lessonRepository.findOne({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${dto.lessonId}" not found`);
    }

    const session = this.sessionRepository.create({
      lessonId: dto.lessonId,
      classId: dto.classId,
      teacherId,
      startedAt: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Get the current active session for the authenticated teacher.
   * Returns null if no active session exists.
   */
  async findCurrentForTeacher(teacherId: string): Promise<LessonSession | null> {
    return this.sessionRepository.findOne({
      where: { teacherId, completedAt: IsNull() },
      relations: ['lesson'],
    });
  }

  /**
   * Get a session by ID with lesson and class relations.
   */
  async findById(id: string): Promise<LessonSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['lesson', 'class'],
    });

    if (!session) {
      throw new NotFoundException(`Lesson session with ID "${id}" not found`);
    }

    return session;
  }

  /**
   * Update session fields (pause/resume, elapsed time, sync status).
   */
  async update(id: string, dto: UpdateSessionDto): Promise<LessonSession> {
    const session = await this.findById(id);

    Object.assign(session, dto);

    return this.sessionRepository.save(session);
  }

  /**
   * Mark a session as complete. Sets completedAt and final elapsedSeconds.
   */
  async complete(id: string, dto: CompleteSessionDto): Promise<LessonSession> {
    const session = await this.findById(id);

    session.completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();

    if (dto.elapsedSeconds !== undefined) {
      session.elapsedSeconds = dto.elapsedSeconds;
    }

    if (dto.reflection !== undefined) {
      session.reflection = dto.reflection;
    }

    if (dto.sentiment !== undefined) {
      session.sentiment = dto.sentiment;
    }

    return this.sessionRepository.save(session);
  }

  /**
   * Get session stats: attendance count and placeholder metrics.
   */
  async getStats(id: string): Promise<{
    attendanceCount: number;
    activitiesDone: number;
    rubricScored: number;
    assessedCount: number;
  }> {
    // Verify session exists
    await this.findById(id);

    const attendanceCount = await this.attendanceRepository.count({
      where: { lessonSessionId: id },
    });

    return {
      attendanceCount,
      activitiesDone: 0,
      rubricScored: 0,
      assessedCount: 0,
    };
  }
}
