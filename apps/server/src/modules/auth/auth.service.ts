import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserStatus, ThemePreference } from '../../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ActivateDto } from './dto/activate.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Validate a user by email/phone and password.
   * Returns the user if credentials are valid, null otherwise.
   */
  async validateUser(identifier: string, password: string): Promise<User | null> {
    const user =
      (await this.usersService.findByEmail(identifier)) ??
      (await this.usersService.findByPhone(identifier));

    if (!user) {
      return null;
    }

    if (!user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Sign in a validated user and return a JWT token + profile.
   */
  async signin(
    user: User,
    role: string,
    rememberMe = false,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    // Verify user has the requested role
    if (user.role !== role) {
      throw new UnauthorizedException(
        `User does not have the "${role}" role`,
      );
    }

    // Verify user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        `Account is not active. Current status: ${user.status}`,
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : '7d',
    });

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Activate an account using an invite code and set a password.
   */
  async activate(
    dto: ActivateDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const user =
      (await this.usersService.findByEmail(dto.identifier)) ??
      (await this.usersService.findByPhone(dto.identifier));

    if (!user) {
      throw new NotFoundException('No account found for the given identifier');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Account is already activated');
    }

    if (user.inviteCode !== dto.inviteCode) {
      throw new BadRequestException('Invalid invite code');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.password, salt);
    user.status = UserStatus.ACTIVE;
    user.inviteCode = null;
    user.acceptedTermsAt = new Date();

    await this.usersRepository.save(user);

    // Auto sign-in after activation
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Generate a 6-digit OTP code for step-up authentication.
   */
  async generateOtp(userId: string): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = code;
    user.otpExpiresAt = expiresAt;
    await this.usersRepository.save(user);

    // TODO: Send OTP via SMS/email service
    // In development, log to console
    console.log(`[DEV] OTP for user ${user.email ?? user.phone}: ${code}`);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify a 6-digit OTP and return a JWT token.
   */
  async verifyOtp(
    userId: string,
    code: string,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.usersService.findById(userId);

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP has been generated for this user');
    }

    if (new Date() > user.otpExpiresAt) {
      // Clear expired OTP
      user.otpCode = null;
      user.otpExpiresAt = null;
      await this.usersRepository.save(user);
      throw new BadRequestException('OTP has expired. Please request a new one');
    }

    if (user.otpCode !== code) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Clear OTP after successful verification
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Generate a password-reset token and (in production) send it to the user.
   */
  async forgotPassword(identifier: string): Promise<{ message: string }> {
    const user =
      (await this.usersService.findByEmail(identifier)) ??
      (await this.usersService.findByPhone(identifier));

    if (!user) {
      // Don't reveal whether the account exists
      return { message: 'If an account exists, reset instructions have been sent' };
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiresAt = expiresAt;
    await this.usersRepository.save(user);

    // TODO: Send reset email/SMS
    console.log(
      `[DEV] Password reset token for ${user.email ?? user.phone}: ${resetToken}`,
    );

    return { message: 'If an account exists, reset instructions have been sent' };
  }

  /**
   * Reset a user's password using a valid reset token.
   */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.usersRepository.findOne({
      where: { resetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
      // Clear expired token
      user.resetToken = null;
      user.resetTokenExpiresAt = null;
      await this.usersRepository.save(user);
      throw new BadRequestException('Reset token has expired. Please request a new one');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;

    // Activate the user if they were in invited status
    if (user.status === UserStatus.INVITED) {
      user.status = UserStatus.ACTIVE;
    }

    await this.usersRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Get the full profile of a user.
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }

  /**
   * Update profile fields (theme, name, etc.).
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.usersService.findById(userId);

    if (dto.themePreference !== undefined) {
      user.themePreference = dto.themePreference as ThemePreference;
    }
    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }

    await this.usersRepository.save(user);
    return this.sanitizeUser(user);
  }

  /**
   * Strip sensitive fields from a user object before returning it.
   */
  private sanitizeUser(user: User): Partial<User> {
    const {
      passwordHash,
      otpCode,
      otpExpiresAt,
      resetToken,
      resetTokenExpiresAt,
      inviteCode,
      ...safe
    } = user;
    return safe;
  }
}
