import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { AiMessage, AiMessageRole } from '../../database/entities/ai-message.entity';
import { ClaudeService } from './claude.service';
import { AiConfig, ModelTier } from '../../database/entities/ai-config.entity';
import { UpdateConfigDto } from './dto/update-config.dto';

/** How many prior turns to replay as context. */
const HISTORY_TURNS = 20;

@Injectable()
export class AiService {
  constructor(
    private readonly claude: ClaudeService,
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
   * Ask the tutor a question and persist both turns.
   *
   * This used to persist the question and answer it with a fixed placeholder
   * string, which a learner reads as a real reply.
   */
  async sendMessage(
    userId: string,
    content: string,
    lessonId?: string,
  ): Promise<{ userMessage: AiMessage; assistantMessage: AiMessage }> {
    // Prior turns give follow-ups something to resolve against; without them
    // every question arrives cold and "why?" is unanswerable.
    const priorTurns = await this.messageRepository.find({
      where: { userId, ...(lessonId ? { lessonId } : {}) },
      order: { createdAt: 'ASC' },
      take: HISTORY_TURNS,
    });
    const history = priorTurns.map((m) => ({
      role: m.role === AiMessageRole.USER ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    const config = await this.getConfig();

    // Ask the model before persisting anything: if it refuses or the service
    // is down, the learner gets an error rather than a question recorded
    // against an answer that never came.
    const answer = await this.claude.reply(content, history, config.modelTier);

    const userMessage = this.messageRepository.create({
      userId,
      lessonId: lessonId ?? undefined,
      role: AiMessageRole.USER,
      content,
    });
    await this.messageRepository.save(userMessage);

    const assistantMessage = this.messageRepository.create({
      userId,
      lessonId: lessonId ?? undefined,
      role: AiMessageRole.ASSISTANT,
      content: answer.text,
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
