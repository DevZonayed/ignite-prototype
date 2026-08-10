import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { LqsService } from './lqs.service';
import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { Badge } from '../../database/entities/badge.entity';
import { BadgeAward } from '../../database/entities/badge-award.entity';
import { Certificate } from '../../database/entities/certificate.entity';
import { User } from '../../database/entities/user.entity';

/**
 * The LQS scale. Everything downstream — the level words on the parent and
 * learner screens, the radar chart, the headline score — is derived from a
 * rating that is only ever 1 to 4, so these boundaries are load-bearing.
 */
describe('LqsService scoring', () => {
  let service: LqsService;
  let dimensionRepo: { find: jest.Mock };
  let scoreRepo: { find: jest.Mock };

  const DIMENSIONS = [
    { id: 'dim-coding', name: 'Coding', color: '#2563EB', weight: '15' },
    { id: 'dim-attendance', name: 'Attendance', color: '#F59E0B', weight: '10' },
  ];

  const buildWith = async (scores: Array<{ dimensionId: string; score: number }>) => {
    dimensionRepo.find.mockResolvedValue(DIMENSIONS);
    scoreRepo.find.mockResolvedValue(scores);
    return service.getLearnerProfile('learner-1');
  };

  beforeEach(async () => {
    dimensionRepo = { find: jest.fn() };
    scoreRepo = { find: jest.fn() };

    const noopRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LqsService,
        { provide: getRepositoryToken(LqsDimension), useValue: dimensionRepo },
        { provide: getRepositoryToken(LqsScore), useValue: scoreRepo },
        { provide: getRepositoryToken(Badge), useValue: noopRepo },
        { provide: getRepositoryToken(BadgeAward), useValue: noopRepo },
        { provide: getRepositoryToken(Certificate), useValue: noopRepo },
        { provide: getRepositoryToken(User), useValue: noopRepo },
      ],
    }).compile();

    service = module.get<LqsService>(LqsService);
  });

  describe('level boundaries', () => {
    it.each([
      [4, 'Secure'],
      [3, 'Secure'],
      [2.9, 'Developing'],
      [2, 'Developing'],
      [1.9, 'Emerging'],
      [1, 'Emerging'],
    ])('rates an average of %s as %s', async (score, expected) => {
      const profile = await buildWith([{ dimensionId: 'dim-coding', score } as LqsScore]);

      expect(profile.dimensions.find((d) => d.dimensionId === 'dim-coding')?.level).toBe(expected);
    });

    it('treats a dimension with no ratings as Emerging, not Secure', async () => {
      const profile = await buildWith([]);

      expect(profile.dimensions.every((d) => d.level === 'Emerging')).toBe(true);
    });
  });

  describe('averaging', () => {
    it('averages repeated ratings of one dimension', async () => {
      const profile = await buildWith([
        { dimensionId: 'dim-coding', score: 2 } as LqsScore,
        { dimensionId: 'dim-coding', score: 4 } as LqsScore,
      ]);

      expect(profile.dimensions.find((d) => d.dimensionId === 'dim-coding')?.averageScore).toBe(3);
    });
  });

  describe('total score', () => {
    it('is 100 when every rated dimension is full marks', async () => {
      const profile = await buildWith([
        { dimensionId: 'dim-coding', score: 4 } as LqsScore,
        { dimensionId: 'dim-attendance', score: 4 } as LqsScore,
      ]);

      expect(profile.totalScore).toBe(100);
    });

    it('is zero when nothing has been rated', async () => {
      const profile = await buildWith([]);

      expect(profile.totalScore).toBe(0);
    });

    it('weights dimensions by their configured weight', async () => {
      // Coding carries weight 15, attendance 10. A perfect coding score and a
      // minimum attendance score must land nearer coding's end of the range.
      const profile = await buildWith([
        { dimensionId: 'dim-coding', score: 4 } as LqsScore,
        { dimensionId: 'dim-attendance', score: 1 } as LqsScore,
      ]);

      // (4*15 + 1*10) / 25 = 2.8 → 2.8 * 25 = 70
      expect(profile.totalScore).toBe(70);
    });

    it('ignores unrated dimensions rather than counting them as zero', async () => {
      // Only coding is rated. Counting attendance as 0 would halve the score
      // for a learner nobody has assessed on it yet.
      const profile = await buildWith([{ dimensionId: 'dim-coding', score: 4 } as LqsScore]);

      expect(profile.totalScore).toBe(100);
    });
  });

  describe('radar data', () => {
    it('normalises a 1-4 rating onto 0-1', async () => {
      dimensionRepo.find.mockResolvedValue(DIMENSIONS);
      scoreRepo.find.mockResolvedValue([
        { dimensionId: 'dim-coding', score: 4 },
        { dimensionId: 'dim-attendance', score: 2 },
      ]);

      const radar = await service.getRadarData('learner-1');

      expect(radar.dimensions).toEqual([
        expect.objectContaining({ name: 'Coding', value: 1 }),
        expect.objectContaining({ name: 'Attendance', value: 0.5 }),
      ]);
    });

    it('never exceeds 1 for a valid rating', async () => {
      // A score stored on the wrong scale (a percentage) is what pushed radar
      // spokes off the chart; every value here must stay inside the axis.
      dimensionRepo.find.mockResolvedValue(DIMENSIONS);
      scoreRepo.find.mockResolvedValue([
        { dimensionId: 'dim-coding', score: 4 },
        { dimensionId: 'dim-attendance', score: 3.8 },
      ]);

      const radar = await service.getRadarData('learner-1');

      expect(radar.dimensions.every((d) => d.value >= 0 && d.value <= 1)).toBe(true);
    });
  });
});
