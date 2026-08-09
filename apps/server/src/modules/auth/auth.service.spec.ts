import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

/**
 * The credential checks every app depends on. These run against doubles rather
 * than a database: the behaviour under test is the decision (is this the right
 * password, is this the right app, is this invite still good), not the storage.
 */
describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; findByPhone: jest.Mock };
  let usersRepository: { save: jest.Mock; findOne: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'teacher@example.com',
      phone: null,
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      firstName: 'Funke',
      lastName: 'Okafor',
      schoolId: 'school-1',
      passwordHash: null,
      inviteCode: null,
      ...overrides,
    }) as User;

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn(), findByPhone: jest.fn() };
    usersRepository = { save: jest.fn(async (u) => u), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'signed.jwt.token') } },
        { provide: ConfigService, useValue: { get: jest.fn(() => undefined) } },
        { provide: MailService, useValue: { sendMail: jest.fn(), send: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(AuditLog), useValue: { save: jest.fn(), create: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('returns the user when the password matches', async () => {
      const passwordHash = await bcrypt.hash('correct-horse', 10);
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      await expect(
        service.validateUser('teacher@example.com', 'correct-horse'),
      ).resolves.toMatchObject({ id: 'user-1' });
    });

    it('returns null when the password is wrong', async () => {
      const passwordHash = await bcrypt.hash('correct-horse', 10);
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      await expect(service.validateUser('teacher@example.com', 'wrong')).resolves.toBeNull();
    });

    it('returns null for an unknown identifier', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);

      await expect(service.validateUser('nobody@example.com', 'anything')).resolves.toBeNull();
    });

    it('refuses an account that has never set a password', async () => {
      // An invited but unactivated account has no hash. Without this guard,
      // bcrypt.compare against null would be the only thing standing between
      // that account and anyone who knows the address.
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash: null }));

      await expect(service.validateUser('teacher@example.com', '')).resolves.toBeNull();
    });

    it('falls back to phone when the identifier is not an email', async () => {
      const passwordHash = await bcrypt.hash('correct-horse', 10);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(makeUser({ passwordHash, phone: '08012345678' }));

      await expect(
        service.validateUser('08012345678', 'correct-horse'),
      ).resolves.toMatchObject({ id: 'user-1' });
    });
  });

  describe('signin', () => {
    it('issues a token for the right role', async () => {
      const result = await service.signin(makeUser(), 'teacher');

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toMatchObject({ id: 'user-1', role: UserRole.TEACHER });
    });

    it('never returns the password hash', async () => {
      const passwordHash = await bcrypt.hash('correct-horse', 10);
      const result = await service.signin(makeUser({ passwordHash }), 'teacher');

      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('refuses a teacher signing in to a parent app', async () => {
      // This is what stops a valid credential from opening the wrong app.
      await expect(service.signin(makeUser(), 'parent')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('refuses an account that is not active', async () => {
      await expect(
        service.signin(makeUser({ status: UserStatus.INVITED }), 'teacher'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('records the sign-in time', async () => {
      await service.signin(makeUser(), 'teacher');

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });
  });

  describe('lookupInvite', () => {
    it('resolves a pending invite to its account', async () => {
      usersRepository.findOne.mockResolvedValue(
        makeUser({ status: UserStatus.INVITED, inviteCode: 'ABCD1234' }),
      );

      await expect(service.lookupInvite('abcd1234')).resolves.toMatchObject({
        email: 'teacher@example.com',
        role: UserRole.TEACHER,
      });
    });

    it('upper-cases and trims the code before looking it up', async () => {
      usersRepository.findOne.mockResolvedValue(
        makeUser({ status: UserStatus.INVITED, inviteCode: 'ABCD1234' }),
      );

      await service.lookupInvite('  abcd1234  ');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { inviteCode: 'ABCD1234' },
      });
    });

    it('refuses a code that has already been used', async () => {
      // The code is cleared on activation, but an active account matching a
      // stale code must not leak its address either.
      usersRepository.findOne.mockResolvedValue(
        makeUser({ status: UserStatus.ACTIVE, inviteCode: 'ABCD1234' }),
      );

      await expect(service.lookupInvite('ABCD1234')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('refuses an unknown code', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.lookupInvite('NOPE')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('refuses an empty code without querying', async () => {
      await expect(service.lookupInvite('')).rejects.toBeInstanceOf(NotFoundException);
      expect(usersRepository.findOne).not.toHaveBeenCalled();
    });
  });
});
