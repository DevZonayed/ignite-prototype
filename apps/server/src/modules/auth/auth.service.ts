import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import {
  User,
  UserRole,
  UserStatus,
  ThemePreference,
} from '../../database/entities/user.entity';
import { AuditLog, AuditResult } from '../../database/entities/audit-log.entity';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { ActivateDto } from './dto/activate.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** How long an emailed password-reset code stays usable. */
const PASSWORD_RESET_OTP_TTL_MINUTES = 10;
/** How long the token issued after a correct code stays usable. */
const PASSWORD_RESET_TOKEN_TTL_MINUTES = 15;
/** Wrong guesses allowed before the code is burned. */
const MAX_PASSWORD_RESET_OTP_ATTEMPTS = 5;

/** Where each role actually belongs, so a refusal can say where to go instead. */
const HOME_FOR_ROLE: Record<string, string> = {
  platform_admin: 'Open the IGNITE admin portal',
  curriculum_admin: 'Open the IGNITE admin portal',
  principal: 'Open the IGNITE school portal',
  teacher: 'Open the IGNITE Teacher app',
  learner: 'Open the IGNITE Learner app',
  parent: 'Open the IGNITE Parent app',
};

@Injectable()
export class AuthService {
  /** Serialises first-admin creation so the "no admins yet" check can't race. */
  private bootstrapLock: Promise<any> = Promise.resolve();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * True while the platform has no platform administrator, i.e. the very first
   * account still needs to be created. Public so the sign-in screen can decide
   * whether to show a login form or a first-run setup prompt.
   */
  async needsBootstrap(): Promise<{ needsBootstrap: boolean }> {
    const count = await this.usersRepository.count({
      where: { role: UserRole.PLATFORM_ADMIN },
    });
    return { needsBootstrap: count === 0 };
  }

  /**
   * Create the first platform administrator.
   *
   * This endpoint is unauthenticated by necessity — there is nobody to
   * authenticate as yet — so the ONLY thing standing between it and a
   * privilege-escalation hole is the "zero platform admins" precondition. It is
   * re-checked inside a serialised critical section so two simultaneous
   * requests cannot both pass it.
   */
  async bootstrapFirstAdmin(
    dto: BootstrapAdminDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Serialise bootstrap attempts; the check and the insert must not interleave.
    this.bootstrapLock = this.bootstrapLock
      .catch(() => undefined)
      .then(() => this.createFirstAdmin(dto));

    return this.bootstrapLock;
  }

  private async createFirstAdmin(
    dto: BootstrapAdminDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const existingAdmins = await this.usersRepository.count({
      where: { role: UserRole.PLATFORM_ADMIN },
    });
    if (existingAdmins > 0) {
      throw new ConflictException(
        'A platform administrator already exists. Sign in instead, or ask an existing admin to invite you.',
      );
    }

    const email = dto.email.trim().toLowerCase();
    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException(`A user with email "${email}" already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const admin = this.usersRepository.create({
      email,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      passwordHash: await bcrypt.hash(dto.password, salt),
      role: UserRole.PLATFORM_ADMIN,
      status: UserStatus.ACTIVE,
      acceptedTermsAt: new Date(),
    });
    const saved = await this.usersRepository.save(admin);

    // First-run account creation is exactly the kind of event an auditor wants.
    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        event: 'Platform bootstrapped: first admin created',
        actorId: saved.id,
        actorName: `${saved.firstName} ${saved.lastName}`,
        target: saved.email ?? undefined,
        result: AuditResult.OK,
        timestamp: new Date(),
      }),
    );

    const accessToken = this.jwtService.sign({
      sub: saved.id,
      email: saved.email,
      role: saved.role,
      schoolId: saved.schoolId,
    });

    return { accessToken, user: this.sanitizeUser(saved) };
  }

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
  /**
   * Resolve a pending invite code to the account it was issued for, so the
   * activation screen can fill the email in and the recipient only supplies the
   * code and a password.
   *
   * Discloses nothing the code holder does not already have: the code was
   * emailed to this address, is high-entropy, and is cleared the moment the
   * account activates — so a spent code stops resolving.
   */
  async lookupInvite(code: string): Promise<{
    email: string | null;
    firstName: string;
    lastName: string;
    role: string;
  }> {
    const inviteCode = (code ?? '').trim().toUpperCase();
    const user = inviteCode
      ? await this.usersRepository.findOne({ where: { inviteCode } })
      : null;

    if (!user || user.status === UserStatus.ACTIVE) {
      throw new NotFoundException('That invite code is not valid any more.');
    }

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

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

    // Checked only after the code is proven, so this can never be used to probe
    // which role an email address holds. `any` is the portals opting out on
    // purpose; a missing role is rejected by the DTO before reaching here.
    if (dto.role !== 'any' && user.role !== dto.role) {
      throw new ForbiddenException(
        `This invite is for a ${user.role.replace(/_/g, ' ')} account. ` +
          `${HOME_FOR_ROLE[user.role] ?? 'Use the IGNITE app for that role'} to activate it.`,
      );
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
   * Step 1 of password reset: email the account a 6-digit OTP.
   *
   * Always reports success so the endpoint cannot be used to discover which
   * addresses have accounts. When SMTP is not configured the code is logged by
   * MailService and echoed back as `devCode` so the flow stays testable.
   */
  async forgotPassword(
    identifier: string,
  ): Promise<{ message: string; delivered: boolean; devCode?: string }> {
    const neutral = {
      message: 'If an account exists, a 6-digit code has been sent to it.',
      delivered: false,
    };

    const user =
      (await this.usersService.findByEmail(identifier)) ??
      (await this.usersService.findByPhone(identifier));

    // No account, or an account with no address to mail: say nothing either way.
    if (!user || !user.email) {
      return neutral;
    }

    const code = this.randomSixDigitCode();

    user.passwordResetOtp = await bcrypt.hash(code, 10);
    user.passwordResetOtpExpiresAt = new Date(
      Date.now() + PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000,
    );
    user.passwordResetOtpAttempts = 0;
    await this.usersRepository.save(user);

    const { delivered } = await this.mailService.sendPasswordResetOtp(
      user.email,
      code,
      PASSWORD_RESET_OTP_TTL_MINUTES,
    );

    // Only ever echo the code when there is no mail transport to deliver it.
    const echoCode = !this.mailService.isConfigured && this.isDevEcho();

    return {
      ...neutral,
      delivered,
      ...(echoCode ? { devCode: code } : {}),
    };
  }

  /**
   * Step 2 of password reset: exchange a valid OTP for a single-use reset token.
   *
   * The token — not the code — authorises the actual password change, so the
   * 6-digit code never has to travel with the new password.
   */
  async verifyPasswordResetOtp(
    identifier: string,
    code: string,
  ): Promise<{ token: string; expiresInMinutes: number }> {
    const user =
      (await this.usersService.findByEmail(identifier)) ??
      (await this.usersService.findByPhone(identifier));

    // Same message for "no such account" and "wrong code" — no enumeration.
    const invalid = new BadRequestException('That code is not valid. Check it and try again.');

    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpiresAt) {
      throw invalid;
    }

    if (new Date() > user.passwordResetOtpExpiresAt) {
      await this.clearPasswordResetOtp(user);
      throw new BadRequestException('That code has expired. Request a new one.');
    }

    if (user.passwordResetOtpAttempts >= MAX_PASSWORD_RESET_OTP_ATTEMPTS) {
      await this.clearPasswordResetOtp(user);
      throw new BadRequestException(
        'Too many incorrect attempts. Request a new code.',
      );
    }

    const matches = await bcrypt.compare(code, user.passwordResetOtp);
    if (!matches) {
      user.passwordResetOtpAttempts += 1;
      await this.usersRepository.save(user);
      throw invalid;
    }

    // Burn the code and hand back a short-lived token. It is returned as
    // `token` (not `resetToken`) because TransformInterceptor strips any field
    // literally named `resetToken` from every response.
    const resetToken = uuidv4();
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpAttempts = 0;
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );
    await this.usersRepository.save(user);

    return { token: resetToken, expiresInMinutes: PASSWORD_RESET_TOKEN_TTL_MINUTES };
  }

  private async clearPasswordResetOtp(user: User): Promise<void> {
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpAttempts = 0;
    await this.usersRepository.save(user);
  }

  /** Uniform 100000-999999, drawn from a CSPRNG rather than Math.random. */
  private randomSixDigitCode(): string {
    return (100000 + randomInt(900000)).toString();
  }

  private isDevEcho(): boolean {
    return (
      this.configService.get<string>('NODE_ENV', 'development') !== 'production' &&
      this.configService.get<string>('AUTH_OTP_DEV_ECHO', 'true') === 'true'
    );
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
    // Any code still outstanding must not survive a completed reset.
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpAttempts = 0;

    // Activate the user if they were in invited status
    if (user.status === UserStatus.INVITED) {
      user.status = UserStatus.ACTIVE;
    }

    await this.usersRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Change the signed-in user's own password.
   *
   * Requires the current password, so a hijacked session cannot lock the real
   * owner out. Any outstanding reset code or token is burned on success.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('The new passwords do not match');
    }

    const user = await this.usersService.findById(userId);

    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account has no password set. Use the reset flow instead.',
      );
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Your current password is not correct');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'The new password must be different from the current one',
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpAttempts = 0;
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
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
      passwordResetOtp,
      passwordResetOtpExpiresAt,
      passwordResetOtpAttempts,
      resetToken,
      resetTokenExpiresAt,
      inviteCode,
      ...safe
    } = user;
    return safe;
  }
}
