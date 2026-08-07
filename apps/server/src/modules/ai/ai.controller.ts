import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { UsageFilterDto } from './dto/usage-filter.dto';

@ApiTags('ai')
@ApiBearerAuth('bearer')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List AI conversations for the current user' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID (admin use)' })
  @ApiQuery({ name: 'lessonId', required: false, description: 'Filter by lesson ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Results per page' })
  @ApiResponse({ status: 200, description: 'Paginated list of AI messages' })
  async findConversations(
    @CurrentUser('id') currentUserId: string,
    @Query('userId') userId?: string,
    @Query('lessonId') lessonId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const effectiveUserId = userId || currentUserId;
    return this.aiService.findConversations(
      effectiveUserId,
      lessonId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  @ApiResponse({ status: 201, description: 'AI response returned' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.aiService.sendMessage(userId, dto.content, dto.lessonId);
  }

  @Get('config')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Get AI platform configuration' })
  @ApiResponse({ status: 200, description: 'Current AI configuration' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async getConfig() {
    return this.aiService.getConfig();
  }

  @Put('config')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Update AI platform configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async updateConfig(@Body() dto: UpdateConfigDto) {
    return this.aiService.updateConfig(dto);
  }

  @Get('usage')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  @ApiResponse({ status: 200, description: 'Aggregated AI usage stats' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async getUsage() {
    return this.aiService.getUsageStats();
  }

  @Get('usage/schools')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Get per-school AI usage breakdown' })
  @ApiResponse({ status: 200, description: 'Paginated school-level AI usage' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async getSchoolUsage(@Query() filters: UsageFilterDto) {
    return this.aiService.getSchoolUsage(filters.page, filters.limit);
  }
}
