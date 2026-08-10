import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { ClassesService } from './classes.service';
import { Class } from '../../database/entities/class.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { School } from '../../database/entities/school.entity';

/**
 * Class enrolment.
 *
 * Before this existed, `getLearners` matched on the class's *school*, so two
 * classes in one school returned identical rosters and no register — attendance,
 * homework compliance, any class-scoped report — could be trusted. These tests
 * pin the register to the enrolment itself.
 */
describe('ClassesService enrolment', () => {
  let service: ClassesService;
  let classRepo: any;
  let userRepo: any;

  const CLASS_A = { id: 'class-a', schoolId: 'school-1', name: 'JSS 1' };
  const CLASS_B = { id: 'class-b', schoolId: 'school-1', name: 'JSS 2' };

  const learner = (over: Partial<any> = {}) => ({
    id: 'learner-1',
    role: UserRole.LEARNER,
    schoolId: 'school-1',
    classId: null,
    ...over,
  });

  beforeEach(async () => {
    classRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      save: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };
    const noopRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(Class), useValue: classRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Attendance), useValue: noopRepo },
        { provide: getRepositoryToken(School), useValue: noopRepo },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  describe('getLearners', () => {
    it('reads the register, not the school', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      await service.getLearners('class-a');

      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { classId: 'class-a', role: UserRole.LEARNER },
        }),
      );
      // The old bug: filtering on schoolId meant every class shared a roster.
      const where = userRepo.find.mock.calls[0][0].where;
      expect(where).not.toHaveProperty('schoolId');
    });

    it('404s for a class that does not exist', async () => {
      classRepo.findOne.mockResolvedValue(null);
      await expect(service.getLearners('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('enrolLearners', () => {
    it('places the learners on the register', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      userRepo.find.mockResolvedValueOnce([learner()]).mockResolvedValue([]);

      await service.enrolLearners('class-a', ['learner-1']);

      expect(userRepo.update).toHaveBeenCalledWith(
        expect.anything(),
        { classId: 'class-a' },
      );
    });

    it('refuses a learner from another school', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      userRepo.find.mockResolvedValueOnce([learner({ schoolId: 'school-2' })]);

      await expect(
        service.enrolLearners('class-a', ['learner-1']),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('refuses a user who is not a learner', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      userRepo.find.mockResolvedValueOnce([learner({ role: UserRole.TEACHER })]);

      await expect(
        service.enrolLearners('class-a', ['learner-1']),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('404s when an id matches no user', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      userRepo.find.mockResolvedValueOnce([]);

      await expect(
        service.enrolLearners('class-a', ['ghost']),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('recounts both classes when a learner moves register', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      userRepo.find
        .mockResolvedValueOnce([learner({ classId: CLASS_B.id })])
        .mockResolvedValue([]);

      await service.enrolLearners('class-a', ['learner-1']);

      const recounted = classRepo.update.mock.calls.map((c: any[]) => c[0].id);
      expect(recounted).toEqual(expect.arrayContaining(['class-a', 'class-b']));
    });
  });

  describe('unenrolLearner', () => {
    it('clears the learner and recounts', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      const row = learner({ classId: 'class-a' });
      userRepo.findOne.mockResolvedValue(row);
      userRepo.count.mockResolvedValue(0);

      await service.unenrolLearner('class-a', 'learner-1');

      expect(row.classId).toBeNull();
      expect(userRepo.save).toHaveBeenCalledWith(row);
      expect(classRepo.update).toHaveBeenCalledWith(
        { id: 'class-a' },
        { learnerCount: 0 },
      );
    });

    it('refuses to remove a learner who is on another register', async () => {
      classRepo.findOne.mockResolvedValue(CLASS_A);
      userRepo.findOne.mockResolvedValue(learner({ classId: 'class-b' }));

      await expect(
        service.unenrolLearner('class-a', 'learner-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll tenancy', () => {
    // The teacher app calls GET /classes with no filter. Unscoped, that handed
    // a teacher every class on the platform, and the app then picked another
    // school's class as the teacher's "active" one.
    beforeEach(() => classRepo.findAndCount.mockResolvedValue([[], 0]));

    it('narrows a teacher to the classes they lead', async () => {
      await service.findAll({} as any, { id: 'teacher-1', role: 'teacher' });

      expect(classRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { teacherId: 'teacher-1' } }),
      );
    });

    it('narrows a principal to their own school', async () => {
      await service.findAll({} as any, {
        id: 'p1',
        role: 'principal',
        schoolId: 'school-1',
      });

      expect(classRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { schoolId: 'school-1' } }),
      );
    });

    it("refuses a principal asking for another school's classes", async () => {
      await expect(
        service.findAll({ schoolId: 'school-2' } as any, {
          id: 'p1',
          role: 'principal',
          schoolId: 'school-1',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets a platform admin see every school', async () => {
      await service.findAll({} as any, { id: 'a1', role: 'platform_admin' });

      expect(classRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });
});
