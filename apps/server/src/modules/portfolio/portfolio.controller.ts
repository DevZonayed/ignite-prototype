import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { PortfolioService } from './portfolio.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PortfolioFilterDto } from './dto/portfolio-filter.dto';

@ApiTags('portfolio')
@ApiBearerAuth('bearer')
@Controller('portfolio')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'List portfolio projects with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of projects' })
  async findAll(@Query() filters: PortfolioFilterDto) {
    return this.portfolioService.findAll(filters);
  }

  @Post('projects')
  @Roles('teacher', 'platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Create a new project record' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Body() dto: CreateProjectDto) {
    return this.portfolioService.create(dto);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project details by ID' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string) {
    return this.portfolioService.findById(id);
  }

  @Patch('projects/:id')
  @Roles('teacher', 'platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.portfolioService.update(id, dto);
  }

  @Post('projects/:id/share')
  @Roles('teacher')
  @ApiOperation({ summary: 'Share project with parent (triggers notification)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project shared' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async share(@Param('id') id: string) {
    return this.portfolioService.shareProject(id);
  }

  @Get('learner/:learnerId')
  @ApiOperation({ summary: 'Get full portfolio for a learner grouped by file type' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner portfolio' })
  async getLearnerPortfolio(@Param('learnerId') learnerId: string) {
    return this.portfolioService.getLearnerPortfolio(learnerId);
  }

  @Get('learner/:learnerId/recent')
  @ApiOperation({ summary: 'Get 3 most recent projects for a learner' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Recent projects' })
  async getRecentProjects(@Param('learnerId') learnerId: string) {
    return this.portfolioService.getRecentProjects(learnerId);
  }

  @Get('learner/:learnerId/progress')
  @ApiOperation({ summary: 'Get learner streak, term progress, badge count, and LQS' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner progress data for home screen' })
  async getLearnerProgress(@Param('learnerId') learnerId: string) {
    return this.portfolioService.getLearnerProgress(learnerId);
  }
}
