import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { Class } from '../../database/entities/class.entity';
import { Evidence } from '../../database/entities/evidence.entity';
import { LessonSession } from '../../database/entities/lesson-session.entity';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,

    @InjectRepository(LessonSession)
    private readonly lessonSessionRepository: Repository<LessonSession>,

    private readonly mailService: MailService,
  ) {}

  /**
   * List users with pagination and optional filters.
   */
  async findAll(
    filters: UserFilterDto,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { role, schoolId, status, search, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<User>[] | FindOptionsWhere<User> = {};
    const conditions: FindOptionsWhere<User> = {};

    if (role) {
      conditions.role = role as User['role'];
    }
    if (schoolId) {
      conditions.schoolId = schoolId;
    }
    if (status) {
      conditions.status = status as User['status'];
    }

    if (search) {
      // Search across firstName, lastName, and email
      const searchConditions: FindOptionsWhere<User>[] = [
        { ...conditions, firstName: ILike(`%${search}%`) },
        { ...conditions, lastName: ILike(`%${search}%`) },
        { ...conditions, email: ILike(`%${search}%`) },
      ];

      const [data, total] = await this.usersRepository.findAndCount({
        where: searchConditions,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total, page, limit };
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where: Object.keys(conditions).length > 0 ? conditions : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Find a user by ID.
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  /**
   * Find a user by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by phone number.
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  /**
   * Create a new user with an invite code.
   */
  async create(dto: CreateUserDto): Promise<User> {
    // Check for duplicate email
    if (dto.email) {
      const existingByEmail = await this.findByEmail(dto.email);
      if (existingByEmail) {
        throw new BadRequestException(
          `A user with email "${dto.email}" already exists`,
        );
      }
    }

    // Check for duplicate phone
    if (dto.phone) {
      const existingByPhone = await this.findByPhone(dto.phone);
      if (existingByPhone) {
        throw new BadRequestException(
          `A user with phone "${dto.phone}" already exists`,
        );
      }
    }

    const inviteCode = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();

    const user = this.usersRepository.create({
      ...dto,
      role: dto.role as UserRole,
      inviteCode,
      status: UserStatus.INVITED,
    });

    const saved = await this.usersRepository.save(user as User);

    // Mail is best effort: the code is also returned to the inviter, so an
    // outage must not fail the invite or lose the account.
    if (saved.email) {
      await this.mailService.sendInviteEmail(
        saved.email,
        `${saved.firstName} ${saved.lastName}`.trim(),
        saved.role,
        inviteCode,
      );
    }

    return saved;
  }

  /**
   * Update an existing user.
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Check for duplicate email if email is being changed
    if (dto.email && dto.email !== user.email) {
      const existingByEmail = await this.findByEmail(dto.email);
      if (existingByEmail) {
        throw new BadRequestException(
          `A user with email "${dto.email}" already exists`,
        );
      }
    }

    // Check for duplicate phone if phone is being changed
    if (dto.phone && dto.phone !== user.phone) {
      const existingByPhone = await this.findByPhone(dto.phone);
      if (existingByPhone) {
        throw new BadRequestException(
          `A user with phone "${dto.phone}" already exists`,
        );
      }
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  /**
   * Update a user's status (activate, suspend, deactivate).
   */
  async updateStatus(
    id: string,
    status: UserStatus,
  ): Promise<User> {
    const user = await this.findById(id);
    user.status = status;
    return this.usersRepository.save(user);
  }

  /**
   * Admin-initiated password reset. Generates a temporary password.
   */
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const user = await this.findById(id);

    const temporaryPassword = uuidv4().substring(0, 12);
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(temporaryPassword, salt);

    await this.usersRepository.save(user);

    return { temporaryPassword };
  }

  /**
   * Delete a user outright.
   *
   * Refused while the account still owns teaching history: `lesson_sessions`
   * and `evidence` both declare ON DELETE CASCADE against the user, so removing
   * an active teacher would silently take real lessons and learner evidence
   * with them. Suspending keeps that history, which is why the error says so.
   *
   * Classes are the one dependency that does not block: `classes.teacherId` is
   * nullable with ON DELETE SET NULL, so a class outlives its teacher as
   * unassigned. They are unassigned explicitly here rather than left to the FK
   * so the count can be reported back and surfaced in the UI.
   */
  async remove(
    id: string,
    actor?: { id: string; role: UserRole; schoolId: string | null },
  ): Promise<{ deleted: true; unassignedClasses: number }> {
    const user = await this.findById(id);

    if (actor && actor.id === user.id) {
      throw new BadRequestException(
        'You cannot delete your own account. Ask another administrator.',
      );
    }

    // A principal administers their own school only, and never an admin.
    if (actor && actor.role === UserRole.PRINCIPAL) {
      if (!user.schoolId || user.schoolId !== actor.schoolId) {
        throw new ForbiddenException(
          'You can only remove people who belong to your own school.',
        );
      }
      if (
        user.role === UserRole.PLATFORM_ADMIN ||
        user.role === UserRole.CURRICULUM_ADMIN
      ) {
        throw new ForbiddenException(
          'You cannot remove an administrator account.',
        );
      }
    }

    const [sessionCount, evidenceCount] = await Promise.all([
      this.lessonSessionRepository.count({ where: { teacherId: id } }),
      this.evidenceRepository.count({ where: { teacherId: id } }),
    ]);

    if (sessionCount > 0 || evidenceCount > 0) {
      const blockers = [
        sessionCount > 0
          ? `${sessionCount} lesson session${sessionCount === 1 ? '' : 's'}`
          : null,
        evidenceCount > 0
          ? `${evidenceCount} evidence record${evidenceCount === 1 ? '' : 's'}`
          : null,
      ].filter(Boolean);

      throw new ConflictException(
        `${user.firstName} ${user.lastName} still has ${blockers.join(
          ' and ',
        )}. Suspend the account instead so that history is kept.`,
      );
    }

    const classes = await this.classRepository.find({
      where: { teacherId: id },
    });
    for (const cls of classes) {
      cls.teacherId = null;
      await this.classRepository.save(cls);
    }

    await this.usersRepository.delete(id);

    return { deleted: true, unassignedClasses: classes.length };
  }

  /**
   * Count total users (for dashboard stats).
   */
  async count(): Promise<number> {
    return this.usersRepository.count();
  }
}
