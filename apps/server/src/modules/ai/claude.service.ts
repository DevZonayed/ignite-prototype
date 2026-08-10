import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { readdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import { ModelTier } from '../../database/entities/ai-config.entity';

/**
 * The model behind the learner-facing tutor.
 *
 * The AI endpoints used to persist both turns and hand back a fixed
 * placeholder string, which reads to a learner as a real (if unhelpful)
 * answer. This calls a model for real, and when no key is configured it says
 * so plainly rather than inventing a reply.
 */
@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly client: Anthropic | null;

  /**
   * The admin-facing "model tier" maps onto real models. Small is the cheap,
   * fast tier for routine questions; large is for the ones worth the spend.
   */
  private static readonly MODEL_BY_TIER: Record<ModelTier, string> = {
    [ModelTier.SMALL]: 'claude-haiku-4-5',
    [ModelTier.LARGE]: 'claude-opus-5',
  };

  private static readonly SYSTEM_PROMPT = [
    'You are the IGNITE study tutor for secondary-school learners on a Digital',
    'Innovation course covering coding, electronics and design thinking.',
    '',
    'Teach rather than answer. When a learner is stuck on a problem that is',
    'theirs to solve, give the next step or the idea they are missing, not the',
    'finished solution — a worked answer they paste in teaches them nothing.',
    'Explaining a concept, correcting a misconception, or reading back their own',
    'code is fair game.',
    '',
    'Keep replies short enough to read on a phone: a few sentences, or a handful',
    'of steps. Plain language, no jargon you have not introduced. If a question',
    'is outside the course, say so briefly and point them at their teacher.',
  ].join('\n');

  constructor() {
    // An unset ANTHROPIC_API_KEY does not mean there are no credentials: the
    // SDK also reads ANTHROPIC_AUTH_TOKEN and an `ant auth login` profile on
    // disk. Gating on the API key alone would refuse on a machine that is
    // perfectly well authenticated, so check the profile directory too.
    this.client = ClaudeService.hasCredentials() ? new Anthropic() : null;
    if (!this.client) {
      this.logger.warn(
        'No Anthropic credentials found (ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, or an `ant auth login` profile) — ' +
          '/ai/conversations will refuse rather than return a canned reply.',
      );
    }
  }

  private static hasCredentials(): boolean {
    if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
      return true;
    }
    const configDir =
      process.env.ANTHROPIC_CONFIG_DIR ??
      join(homedir(), '.config', 'anthropic');
    try {
      return readdirSync(join(configDir, 'credentials')).some((f) =>
        f.endsWith('.json'),
      );
    } catch {
      return false;
    }
  }

  get configured(): boolean {
    return this.client !== null;
  }

  /**
   * Ask the tutor a question.
   *
   * `history` is the prior turns of this learner's conversation, oldest first,
   * so follow-ups ("why?") resolve against what was actually said.
   */
  async reply(
    question: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    tier: ModelTier,
  ): Promise<{ text: string; model: string; inputTokens: number; outputTokens: number }> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'The AI tutor is not configured on this server. Set ANTHROPIC_API_KEY to enable it.',
      );
    }

    const model = ClaudeService.MODEL_BY_TIER[tier] ?? ClaudeService.MODEL_BY_TIER[ModelTier.SMALL];

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 1024,
        system: ClaudeService.SYSTEM_PROMPT,
        messages: [...history, { role: 'user' as const, content: question }],
      });

      // A refusal is a normal outcome, not an exception — check it before
      // reading content, which is empty when the model declines.
      if (response.stop_reason === 'refusal') {
        return {
          text: "I can't help with that one. Ask your teacher, or try rephrasing it around the lesson you're working on.",
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        };
      }

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();

      return {
        text: text || 'I did not manage to put an answer together. Try asking again.',
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (error) {
      // Typed SDK errors, most specific first — a rate limit is worth retrying,
      // a bad request is not, and the learner should not see either verbatim.
      if (error instanceof Anthropic.RateLimitError) {
        this.logger.warn('Claude rate limit hit');
        throw new ServiceUnavailableException(
          'The tutor is busy right now. Try again in a moment.',
        );
      }
      if (error instanceof Anthropic.APIConnectionError) {
        this.logger.error(`Could not reach Claude: ${error.message}`);
        throw new ServiceUnavailableException(
          'The tutor could not be reached. Check your connection and try again.',
        );
      }
      if (error instanceof Anthropic.APIError) {
        this.logger.error(`Claude API error ${error.status}: ${error.message}`);
        throw new ServiceUnavailableException('The tutor is unavailable right now.');
      }
      throw error;
    }
  }
}
