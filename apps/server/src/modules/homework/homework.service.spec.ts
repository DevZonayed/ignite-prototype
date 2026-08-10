import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';

import { HomeworkService } from './homework.service';
import { Homework } from '../../database/entities/homework.entity';
import { HomeworkSubmission } from '../../database/entities/homework-submission.entity';
import { HomeworkMessage } from '../../database/entities/homework-message.entity';
import { ParentChild } from '../../database/entities/parent-child.entity';
import { Class } from '../../database/entities/class.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Homework tenancy.
 *
 * Homework carries no schoolId — the school is only reachable through the
 * class — so any role that reaches the query unscoped reads every school's
 * rows. That is exactly what happened to principals: one school's dashboard
 * listed another school's homework. Each role below must narrow by class.
 */
describe('HomeworkService.findAll scoping', () => {
  let service: HomeworkService;
  let homeworkRepo: any;
  let classRepo: any;
  let userRepo: any;
  let parentChildRepo: any;

  const whereOf = () => homeworkRepo.findAndCount.mock.calls[0][0].where;

  beforeEach(async () => {
    homeworkRepo = { findAndCount: jest.fn().mockResolvedValue([[], 0]) };
    classRepo = { find: jest.fn().mockResolvedValue([]) };
    userRepo = { find: jest.fn().mockResolvedValue([]), findOne: jest.fn() };
    parentChildRepo = { find: jest.fn().mockResolvedValue([]) };
    const noopRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeworkService,
        { provide: getRepositoryToken(Homework), useValue: homeworkRepo },
        { provide: getRepositoryToken(HomeworkSubmission), useValue: noopRepo },
        { provide: getRepositoryToken(HomeworkMessage), useValue: noopRepo },
        { provide: getRepositoryToken(ParentChild), useValue: parentChildRepo },
        { provide: getRepositoryToken(Class), useValue: classRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<HomeworkService>(HomeworkService);
  });

  it('narrows a principal to their own school\'s classes', async () => {
    classRepo.find.mockResolvedValue([{ id: 'class-a' }, { id: 'class-b' }]);

    await service.findAll({} as any, {
      id: 'p1',
      role: 'principal',
      schoolId: 'school-1',
    });

    expect(classRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { schoolId: 'school-1' } }),
    );
    expect(whereOf().classId).toBeDefined();
  });

  it('returns nothing rather than everything when a principal has no classes', async () => {
    classRepo.find.mockResolvedValue([]);

    const res = await service.findAll({} as any, {
      id: 'p1',
      role: 'principal',
      schoolId: 'school-1',
    });

    expect(res).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    expect(homeworkRepo.findAndCount).not.toHaveBeenCalled();
  });

  it('refuses a principal asking for another school\'s class', async () => {
    classRepo.find.mockResolvedValue([{ id: 'class-a' }]);

    await expect(
      service.findAll({ classId: 'class-elsewhere' } as any, {
        id: 'p1',
        role: 'principal',
        schoolId: 'school-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('narrows a learner to their own class', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'l1', classId: 'class-a' });

    await service.findAll({} as any, { id: 'l1', role: 'learner' });

    expect(whereOf().classId).toBe('class-a');
  });

  it('returns nothing for a learner on no register', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'l1', classId: null });

    const res = await service.findAll({} as any, { id: 'l1', role: 'learner' });

    expect(res.total).toBe(0);
    expect(homeworkRepo.findAndCount).not.toHaveBeenCalled();
  });

  it('denies an unrecognised role instead of leaking the table', async () => {
    const res = await service.findAll({} as any, { id: 'x', role: 'visitor' });

    expect(res).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    expect(homeworkRepo.findAndCount).not.toHaveBeenCalled();
  });

  it('lets a platform admin see across schools', async () => {
    await service.findAll({} as any, { id: 'a1', role: 'platform_admin' });

    expect(homeworkRepo.findAndCount).toHaveBeenCalled();
  });
});
