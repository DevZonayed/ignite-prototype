import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    return this.usersRepository.save(user as User);
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
   * Count total users (for dashboard stats).
   */
  async count(): Promise<number> {
    return this.usersRepository.count();
  }
}
