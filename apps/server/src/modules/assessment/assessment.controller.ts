import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { AssessmentService } from './assessment.service';
import { CreateAssessmentBulkDto } from './dto/create-assessment-bulk.dto';
import { AssessmentFilterDto } from './dto/assessment-filter.dto';
import { DistributionQueryDto } from './dto/distribution-query.dto';

@ApiTags('assessments')
@ApiBearerAuth('bearer')
@Controller('assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get()
  @ApiOperation({ summary: 'List assessments with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of assessments' })
  async findAll(@Query() filters: AssessmentFilterDto) {
    return this.assessmentService.findAll(filters);
  }

  @Post('bulk')
  @Roles('teacher')
  @ApiOperation({ summary: 'Bulk save outcome scores for multiple learners' })
  @ApiResponse({ status: 201, description: 'Assessments created or updated' })
  async bulkCreate(@Body() dto: CreateAssessmentBulkDto) {
    return this.assessmentService.bulkCreate(
      dto.lessonId,
      dto.lessonSessionId,
      dto.assessments,
    );
  }

  @Get('distribution')
  @Roles('principal', 'platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Assessment distribution for school portal chart' })
  @ApiResponse({ status: 200, description: 'Assessment distribution counts' })
  async getDistribution(@Query() query: DistributionQueryDto) {
    return this.assessmentService.getDistribution(query);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get all assessments for a lesson session' })
  @ApiParam({ name: 'sessionId', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session assessments with learner details' })
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.assessmentService.findBySession(sessionId);
  }

  @Get('learner/:learnerId')
  @ApiOperation({ summary: 'Assessment history for a specific learner' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner assessment history' })
  async findByLearner(
    @Param('learnerId') learnerId: string,
    @Query('term') term?: string,
  ) {
    return this.assessmentService.findByLearner(learnerId, term);
  }
}
