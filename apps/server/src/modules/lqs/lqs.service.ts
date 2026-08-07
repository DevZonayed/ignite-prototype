import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { LqsDimension } from '../../database/entities/lqs-dimension.entity';
import { LqsScore } from '../../database/entities/lqs-score.entity';
import { Badge } from '../../database/entities/badge.entity';
import { BadgeAward } from '../../database/entities/badge-award.entity';
import { Certificate } from '../../database/entities/certificate.entity';
import { UpdateDimensionsDto } from './dto/update-dimensions.dto';
import { SaveScoreDto } from './dto/save-score.dto';
import { SaveScoresBulkDto } from './dto/save-scores-bulk.dto';
import { ScoreFilterDto } from './dto/score-filter.dto';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { AwardBadgeDto } from './dto/award-badge.dto';

@Injectable()
export class LqsService {
  constructor(
    @InjectRepository(LqsDimension)
    private readonly dimensionRepo: Repository<LqsDimension>,

    @InjectRepository(LqsScore)
    private readonly scoreRepo: Repository<LqsScore>,

    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,

    @InjectRepository(BadgeAward)
    private readonly badgeAwardRepo: Repository<BadgeAward>,

    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
  ) {}

  // ── Dimensions ──────────────────────────────────────────────────────

  /**
   * Return all LQS dimensions ordered by name.
   */
  async getDimensions(): Promise<LqsDimension[]> {
    return this.dimensionRepo.find({ order: { name: 'ASC' } });
  }

  /**
   * Update / upsert dimension definitions.
   * Validates that weights total exactly 100.
   */
  async updateDimensions(dto: UpdateDimensionsDto): Promise<LqsDimension[]> {
    const totalWeight = dto.dimensions.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight !== 100) {
      throw new BadRequestException(
        `Dimension weights must total 100 — received ${totalWeight}`,
      );
    }

    const saved: LqsDimension[] = [];

    for (const item of dto.dimensions) {
      let dimension: LqsDimension;

      if (item.id) {
        const existing = await this.dimensionRepo.findOne({ where: { id: item.id } });
        dimension = existing ?? this.dimensionRepo.create();
      } else {
        dimension = this.dimensionRepo.create();
      }

      dimension.name = item.name;
      dimension.color = item.color;
      dimension.weight = item.weight;
      if (dto.rubricVersion !== undefined) {
        dimension.rubricVersion = dto.rubricVersion;
      }

      saved.push(await this.dimensionRepo.save(dimension));
    }

    return saved;
  }

  // ── Scores ──────────────────────────────────────────────────────────

  /**
   * Query scores with optional filters.
   */
  async getScores(filter: ScoreFilterDto): Promise<LqsScore[]> {
    const where: FindOptionsWhere<LqsScore> = {};

    if (filter.learnerId) {
      where.learnerId = filter.learnerId;
    }
    if (filter.dimensionId) {
      where.dimensionId = filter.dimensionId;
    }
    if (filter.term) {
      where.term = filter.term;
    }
    if (filter.lessonId) {
      where.lessonId = filter.lessonId;
    }

    return this.scoreRepo.find({
      where,
      relations: ['dimension'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Save rubric scores for a single learner.
   * Upserts by learnerId + lessonId + dimensionId.
   */
  async saveScore(dto: SaveScoreDto): Promise<LqsScore[]> {
    const saved: LqsScore[] = [];

    for (const entry of dto.scores) {
      const where: FindOptionsWhere<LqsScore> = {
        learnerId: dto.learnerId,
        dimensionId: entry.dimensionId,
      };
      if (dto.lessonId) {
        where.lessonId = dto.lessonId;
      }

      let score = await this.scoreRepo.findOne({ where });

      if (!score) {
        score = this.scoreRepo.create({
          learnerId: dto.learnerId,
          lessonId: dto.lessonId,
          dimensionId: entry.dimensionId,
          term: dto.term,
        });
      }

      score.score = entry.score;
      score.term = dto.term ?? score.term;
      score.savedAt = new Date();

      saved.push(await this.scoreRepo.save(score));
    }

    return saved;
  }

  /**
   * Save rubric scores for multiple learners at once.
   */
  async saveScoresBulk(dto: SaveScoresBulkDto): Promise<LqsScore[]> {
    const allSaved: LqsScore[] = [];

    for (const entry of dto.entries) {
      const result = await this.saveScore({
        learnerId: entry.learnerId,
        lessonId: dto.lessonId,
        term: dto.term,
        scores: entry.scores,
      });
      allSaved.push(...result);
    }

    return allSaved;
  }

  /**
   * Build a learner's full LQS profile — average per dimension + weighted total.
   */
  async getLearnerProfile(learnerId: string): Promise<{
    learnerId: string;
    totalScore: number;
    dimensions: {
      dimensionId: string;
      name: string;
      color: string;
      weight: number;
      averageScore: number;
      level: string;
    }[];
  }> {
    const dimensions = await this.dimensionRepo.find({ order: { name: 'ASC' } });
    const scores = await this.scoreRepo.find({
      where: { learnerId },
      relations: ['dimension'],
    });

    const grouped: Record<string, LqsScore[]> = {};
    for (const s of scores) {
      if (!grouped[s.dimensionId]) {
        grouped[s.dimensionId] = [];
      }
      grouped[s.dimensionId].push(s);
    }

    let weightedSum = 0;
    let totalWeight = 0;

    const dimensionResults = dimensions.map((dim) => {
      const dimScores = grouped[dim.id] || [];
      const averageScore =
        dimScores.length > 0
          ? dimScores.reduce((sum, s) => sum + s.score, 0) / dimScores.length
          : 0;

      let level: string;
      if (averageScore >= 3) {
        level = 'Secure';
      } else if (averageScore >= 2) {
        level = 'Developing';
      } else {
        level = 'Emerging';
      }

      const weight = Number(dim.weight);
      if (dimScores.length > 0) {
        weightedSum += averageScore * weight;
        totalWeight += weight;
      }

      return {
        dimensionId: dim.id,
        name: dim.name,
        color: dim.color,
        weight,
        averageScore: Math.round(averageScore * 100) / 100,
        level,
      };
    });

    // Normalise 1–4 scale to 0–100: (weighted average / 4) * 100 ≈ weighted average * 25
    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const totalScore = Math.round(weightedAverage * 25 * 100) / 100;

    return { learnerId, totalScore, dimensions: dimensionResults };
  }

  /**
   * Radar chart data — dimension scores normalised to 0-1.
   */
  async getRadarData(
    learnerId: string,
  ): Promise<{
    learnerId: string;
    dimensions: { name: string; value: number; color: string }[];
  }> {
    const profile = await this.getLearnerProfile(learnerId);

    const dimensions = profile.dimensions.map((d) => ({
      name: d.name,
      value: Math.round((d.averageScore / 4) * 100) / 100,
      color: d.color,
    }));

    return { learnerId, dimensions };
  }

  // ── Badges ──────────────────────────────────────────────────────────

  /**
   * Return all badge definitions.
   */
  async getBadges(): Promise<Badge[]> {
    return this.badgeRepo.find({ order: { name: 'ASC' } });
  }

  /**
   * Create a new badge definition.
   */
  async createBadge(dto: CreateBadgeDto): Promise<Badge> {
    const badge = this.badgeRepo.create(dto);
    return this.badgeRepo.save(badge);
  }

  /**
   * Update an existing badge's trigger rule or other fields.
   */
  async updateBadge(id: string, dto: Partial<CreateBadgeDto>): Promise<Badge> {
    const badge = await this.badgeRepo.findOne({ where: { id } });
    if (!badge) {
      throw new NotFoundException(`Badge with ID "${id}" not found`);
    }
    Object.assign(badge, dto);
    return this.badgeRepo.save(badge);
  }

  /**
   * Get all badges for a learner — each with earned status.
   */
  async getLearnerBadges(
    learnerId: string,
  ): Promise<
    {
      badge: Badge;
      earned: boolean;
      awardedAt: Date | null;
    }[]
  > {
    const badges = await this.badgeRepo.find({ order: { name: 'ASC' } });
    const awards = await this.badgeAwardRepo.find({ where: { learnerId } });

    const awardMap = new Map<string, BadgeAward>();
    for (const award of awards) {
      awardMap.set(award.badgeId, award);
    }

    return badges.map((badge) => {
      const award = awardMap.get(badge.id);
      return {
        badge,
        earned: !!award,
        awardedAt: award ? award.awardedAt : null,
      };
    });
  }

  /**
   * Award a badge to a learner.
   */
  async awardBadge(dto: AwardBadgeDto): Promise<BadgeAward> {
    const badge = await this.badgeRepo.findOne({ where: { id: dto.badgeId } });
    if (!badge) {
      throw new NotFoundException(`Badge with ID "${dto.badgeId}" not found`);
    }

    const award = this.badgeAwardRepo.create({
      badgeId: dto.badgeId,
      learnerId: dto.learnerId,
      linkedProjectId: dto.linkedProjectId,
      awardedAt: new Date(),
    });

    return this.badgeAwardRepo.save(award);
  }

  // ── Certificates ────────────────────────────────────────────────────

  private readonly defaultTemplate = `
<html>
<body style="font-family: sans-serif; text-align: center; padding: 40px;">
  <h1>Certificate of Achievement</h1>
  <p>This certifies that <strong>{{learnerName}}</strong></p>
  <p>has successfully completed <strong>{{course}}</strong></p>
  <p>during <strong>{{term}}</strong> at <strong>{{school}}</strong></p>
  <p>Issued on: {{issueDate}}</p>
  <p>Certificate ID: {{certificateId}}</p>
</body>
</html>`.trim();

  /**
   * Get the current certificate template.
   */
  async getTemplate(): Promise<{ templateHtml: string }> {
    const cert = await this.certificateRepo.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    return { templateHtml: cert?.templateHtml || this.defaultTemplate };
  }

  /**
   * Update (upsert) the certificate template.
   */
  async updateTemplate(templateHtml: string): Promise<{ templateHtml: string }> {
    // Find an existing certificate record to store the template, or create a placeholder
    let cert = await this.certificateRepo.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    if (cert) {
      cert.templateHtml = templateHtml;
      await this.certificateRepo.save(cert);
    } else {
      cert = this.certificateRepo.create({
        id: 'TEMPLATE-DEFAULT',
        learnerId: '00000000-0000-0000-0000-000000000000',
        templateHtml,
      });
      await this.certificateRepo.save(cert);
    }

    return { templateHtml };
  }

  /**
   * Preview the certificate template with sample data.
   */
  async previewTemplate(): Promise<{ html: string }> {
    const { templateHtml } = await this.getTemplate();

    const html = templateHtml
      .replace(/\{\{learnerName\}\}/g, 'Jane Doe')
      .replace(/\{\{course\}\}/g, 'Introduction to Coding')
      .replace(/\{\{term\}\}/g, 'Term 1 2026')
      .replace(/\{\{school\}\}/g, 'Springfield Academy')
      .replace(/\{\{issueDate\}\}/g, '2026-06-15')
      .replace(/\{\{certificateId\}\}/g, 'IGN-2026-0001');

    return { html };
  }

  /**
   * Get a learner's certificate.
   */
  async getLearnerCertificate(learnerId: string): Promise<Certificate> {
    const cert = await this.certificateRepo.findOne({
      where: { learnerId },
    });
    if (!cert) {
      throw new NotFoundException(
        `Certificate for learner "${learnerId}" not found`,
      );
    }
    return cert;
  }

  /**
   * Download a learner's certificate as PDF (stub).
   */
  async downloadCertificate(
    learnerId: string,
  ): Promise<{ message: string }> {
    return { message: 'PDF generation not yet implemented' };
  }
}
