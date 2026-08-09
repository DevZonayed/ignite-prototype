import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LqsService } from './lqs.service';
import { UpdateDimensionsDto } from './dto/update-dimensions.dto';
import { SaveScoreDto } from './dto/save-score.dto';
import { SaveScoresBulkDto } from './dto/save-scores-bulk.dto';
import { ScoreFilterDto } from './dto/score-filter.dto';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { AwardBadgeDto } from './dto/award-badge.dto';

@ApiTags('lqs')
@ApiBearerAuth('bearer')
@Controller('lqs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LqsController {
  constructor(private readonly lqsService: LqsService) {}

  // ── Dimensions ──────────────────────────────────────────────────────

  @Get('dimensions')
  @ApiOperation({ summary: 'Get all LQS dimensions with weights and colours' })
  @ApiResponse({ status: 200, description: 'List of LQS dimensions' })
  async getDimensions() {
    return this.lqsService.getDimensions();
  }

  @Put('dimensions')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Save rubric config, weights must total 100' })
  @ApiResponse({ status: 200, description: 'Dimensions updated' })
  @ApiResponse({ status: 400, description: 'Weights do not total 100' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async updateDimensions(@Body() dto: UpdateDimensionsDto) {
    return this.lqsService.updateDimensions(dto);
  }

  // ── Scores ──────────────────────────────────────────────────────────

  @Get('scores')
  @ApiOperation({ summary: 'Get scores with optional filters' })
  @ApiResponse({ status: 200, description: 'List of LQS scores' })
  async getScores(@Query() filter: ScoreFilterDto) {
    return this.lqsService.getScores(filter);
  }

  @Post('scores')
  @Roles('teacher')
  @ApiOperation({ summary: 'Save rubric scores for a learner' })
  @ApiResponse({ status: 201, description: 'Scores saved' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async saveScore(@Body() dto: SaveScoreDto) {
    return this.lqsService.saveScore(dto);
  }

  @Post('scores/bulk')
  @Roles('teacher')
  @ApiOperation({ summary: 'Save rubric scores for multiple learners at once' })
  @ApiResponse({ status: 201, description: 'Bulk scores saved' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async saveScoresBulk(@Body() dto: SaveScoresBulkDto) {
    return this.lqsService.saveScoresBulk(dto);
  }

  @Get('learner/:learnerId')
  @ApiOperation({ summary: "Get a learner's full LQS profile" })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner LQS profile' })
  async getLearnerProfile(@Param('learnerId') learnerId: string) {
    return this.lqsService.getLearnerProfile(learnerId);
  }

  @Get('learner/:learnerId/radar')
  @ApiOperation({ summary: 'Radar chart data for a learner' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Radar chart data' })
  async getRadarData(@Param('learnerId') learnerId: string) {
    return this.lqsService.getRadarData(learnerId);
  }

  // ── Badges ──────────────────────────────────────────────────────────

  @Get('badges')
  @ApiOperation({ summary: 'List all badge definitions' })
  @ApiResponse({ status: 200, description: 'List of badges' })
  async getBadges() {
    return this.lqsService.getBadges();
  }

  @Post('badges')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Create a new badge definition' })
  @ApiResponse({ status: 201, description: 'Badge created' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async createBadge(@Body() dto: CreateBadgeDto) {
    return this.lqsService.createBadge(dto);
  }

  @Put('badges/:id')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update a badge trigger rule' })
  @ApiParam({ name: 'id', description: 'Badge UUID' })
  @ApiResponse({ status: 200, description: 'Badge updated' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async updateBadge(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBadgeDto>,
  ) {
    return this.lqsService.updateBadge(id, dto);
  }

  @Get('badges/learner/:learnerId')
  @ApiOperation({ summary: 'Badges for a learner, earned and locked' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner badges' })
  async getLearnerBadges(@Param('learnerId') learnerId: string) {
    return this.lqsService.getLearnerBadges(learnerId);
  }

  @Post('badges/award')
  @Roles('teacher')
  @ApiOperation({ summary: 'Award a badge to a learner' })
  @ApiResponse({ status: 201, description: 'Badge awarded' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async awardBadge(@Body() dto: AwardBadgeDto) {
    return this.lqsService.awardBadge(dto);
  }

  // ── Certificates ────────────────────────────────────────────────────

  @Get('certificates/template')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Get certificate template' })
  @ApiResponse({ status: 200, description: 'Certificate template' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getTemplate() {
    return this.lqsService.getTemplate();
  }

  @Put('certificates/template')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update certificate template' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async updateTemplate(@Body() body: { templateHtml: string }) {
    return this.lqsService.updateTemplate(body.templateHtml);
  }

  @Get('certificates/template/preview')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Preview certificate with sample data' })
  @ApiResponse({ status: 200, description: 'Template preview HTML' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async previewTemplate() {
    return this.lqsService.previewTemplate();
  }

  @Get('certificates/learner/:learnerId')
  @ApiOperation({ summary: "Get a learner's certificate" })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner certificate' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async getLearnerCertificate(@Param('learnerId') learnerId: string) {
    return this.lqsService.getLearnerCertificate(learnerId);
  }

  @Get('certificates/learner/:learnerId/download')
  @ApiOperation({ summary: 'Download certificate as PDF' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'PDF download' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async downloadCertificate(@Param('learnerId') learnerId: string) {
    return this.lqsService.downloadCertificate(learnerId);
  }
}
