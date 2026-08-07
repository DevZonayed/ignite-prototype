import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { AiMessage, AiMessageRole } from '../../database/entities/ai-message.entity';
import { AiConfig, ModelTier } from '../../database/entities/ai-config.entity';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiMessage)
    private readonly messageRepository: Repository<AiMessage>,
    @InjectRepository(AiConfig)
    private readonly configRepository: Repository<AiConfig>,
  ) {}

  /**
   * Find paginated AI conversations for a user, optionally scoped to a lesson.
   */
  async findConversations(
    userId: string,
    lessonId?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: AiMessage[]; total: number; page: number; limit: number }> {
    const where: Record<string, any> = { userId };
    if (lessonId) {
      where.lessonId = lessonId;
    }

    const [data, total] = await this.messageRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Send a message and return a mock AI response.
   * In production this will call the AI provider; for now it persists the user
   * message and returns a stub assistant reply.
   */
  async sendMessage(
    userId: string,
    content: string,
    lessonId?: string,
  ): Promise<{ userMessage: AiMessage; assistantMessage: AiMessage }> {
    // Persist the user message
    const userMessage = this.messageRepository.create({
      userId,
      lessonId: lessonId ?? undefined,
      role: AiMessageRole.USER,
      content,
    });
    await this.messageRepository.save(userMessage);

    // Generate a stub assistant reply
    const assistantMessage = this.messageRepository.create({
      userId,
      lessonId: lessonId ?? undefined,
      role: AiMessageRole.ASSISTANT,
      content:
        'Thank you for your question! This is a placeholder response. ' +
        'The AI integration is not yet connected to a live model.',
    });
    await this.messageRepository.save(assistantMessage);

    return { userMessage, assistantMessage };
  }

  /**
   * Retrieve the global AI configuration (first row or default).
   */
  async getConfig(): Promise<AiConfig> {
    const config = await this.configRepository.findOne({ where: {} });
    if (config) {
      return config;
    }

    // Seed a default config row if none exists
    const defaultConfig = this.configRepository.create({
      modelTier: ModelTier.SMALL,
      monthlyCallCap: 1000,
      requireTeacherReview: true,
    });
    return this.configRepository.save(defaultConfig) as Promise<AiConfig>;
  }

  /**
   * Update the global AI configuration.
   */
  async updateConfig(dto: UpdateConfigDto): Promise<AiConfig> {
    const config = await this.getConfig();
    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  /**
   * Return aggregated usage statistics.
   */
  async getUsageStats(): Promise<{
    callsThisMonth: number;
    estimatedSpend: number;
    reportsPublished: number;
    teacherReviewRate: number;
  }> {
    const config = await this.getConfig();
    return {
      callsThisMonth: config.callsThisMonth,
      estimatedSpend: Number(config.estimatedSpend),
      reportsPublished: config.reportsPublished,
      teacherReviewRate: Number(config.teacherReviewRate),
    };
  }

  /**
   * Return paginated per-school AI usage breakdown.
   * Currently returns stub data; will query aggregated stats once school-level
   * tracking is implemented.
   */
  async getSchoolUsage(
    page = 1,
    limit = 20,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    // Stub: return an empty list until per-school usage tracking is wired up
    return { data: [], total: 0, page, limit };
  }
}
