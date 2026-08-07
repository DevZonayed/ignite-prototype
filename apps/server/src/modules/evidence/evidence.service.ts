import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { Evidence } from '../../database/entities/evidence.entity';
import { EvidenceTag } from '../../database/entities/evidence-tag.entity';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceFilterDto } from './dto/evidence-filter.dto';

@Injectable()
export class EvidenceService {
  constructor(
    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,
    @InjectRepository(EvidenceTag)
    private readonly evidenceTagRepository: Repository<EvidenceTag>,
  ) {}

  /**
   * List evidence items with filters and pagination.
   */
  async findAll(
    filters: EvidenceFilterDto,
  ): Promise<{ data: Evidence[]; total: number; page: number; limit: number }> {
    const { lessonId, classId, teacherId, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<Evidence> = {};

    if (lessonId) {
      where.lessonId = lessonId;
    }
    if (classId) {
      where.classId = classId;
    }
    if (teacherId) {
      where.teacherId = teacherId;
    }

    const [data, total] = await this.evidenceRepository.findAndCount({
      where,
      relations: ['tags'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Create a new evidence record and optionally tag learners.
   */
  async create(
    dto: CreateEvidenceDto,
    teacherId: string,
  ): Promise<Evidence> {
    const evidence = this.evidenceRepository.create({
      lessonId: dto.lessonId,
      classId: dto.classId,
      teacherId,
      mediaType: dto.mediaType,
      fileUrl: dto.fileUrl,
      consentChecked: dto.consentChecked,
    });

    const saved = await this.evidenceRepository.save(evidence);

    if (dto.learnerIds && dto.learnerIds.length > 0) {
      const tags = dto.learnerIds.map((learnerId) =>
        this.evidenceTagRepository.create({
          evidenceId: saved.id,
          learnerId,
        }),
      );
      await this.evidenceTagRepository.save(tags);
    }

    return this.findById(saved.id);
  }

  /**
   * Get a single evidence item by ID with learner tags.
   */
  async findById(id: string): Promise<Evidence> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID "${id}" not found`);
    }

    return evidence;
  }

  /**
   * Remove an evidence item by ID.
   */
  async remove(id: string): Promise<void> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID "${id}" not found`);
    }

    await this.evidenceRepository.remove(evidence);
  }

  /**
   * Tag learners on an existing evidence item.
   */
  async addTags(id: string, learnerIds: string[]): Promise<EvidenceTag[]> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID "${id}" not found`);
    }

    const tags = learnerIds.map((learnerId) =>
      this.evidenceTagRepository.create({
        evidenceId: id,
        learnerId,
      }),
    );

    return this.evidenceTagRepository.save(tags);
  }

  /**
   * Remove a specific learner tag from an evidence item.
   */
  async removeTag(id: string, learnerId: string): Promise<void> {
    const tag = await this.evidenceTagRepository.findOne({
      where: { evidenceId: id, learnerId },
    });

    if (!tag) {
      throw new NotFoundException(
        `Tag for learner "${learnerId}" not found on evidence "${id}"`,
      );
    }

    await this.evidenceTagRepository.remove(tag);
  }
}
