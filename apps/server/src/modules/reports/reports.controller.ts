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
import { ReportsService } from './reports.service';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';
import { UpdateProgressReportDto } from './dto/update-progress-report.dto';
import { PublishReportDto } from './dto/publish-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { CreateSchoolReportDto } from './dto/create-school-report.dto';
import { SchoolReportFilterDto } from './dto/school-report-filter.dto';

@ApiTags('reports')
@ApiBearerAuth('bearer')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ── Progress Reports ──────────────────────────────────────────────

  @Get('progress')
  @Roles('teacher', 'parent', 'platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'List progress reports with filters' })
  @ApiResponse({ status: 200, description: 'List of progress reports' })
  async getProgressReports(@Query() filters: ReportFilterDto) {
    return this.reportsService.getProgressReports(filters);
  }

  @Get('progress/:id')
  @Roles('teacher', 'parent', 'platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Get progress report details' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'Report details' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getProgressReport(@Param('id') id: string) {
    return this.reportsService.getProgressReport(id);
  }

  @Post('progress')
  @Roles('teacher', 'platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Generate a progress report for a learner' })
  @ApiResponse({ status: 201, description: 'Progress report created' })
  async createProgressReport(@Body() dto: CreateProgressReportDto) {
    return this.reportsService.createProgressReport(dto);
  }

  @Patch('progress/:id')
  @Roles('teacher', 'platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update a progress report before publishing' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'Report updated' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async updateProgressReport(
    @Param('id') id: string,
    @Body() dto: UpdateProgressReportDto,
  ) {
    return this.reportsService.updateProgressReport(id, dto);
  }

  @Patch('progress/:id/publish')
  @Roles('teacher', 'platform_admin')
  @ApiOperation({ summary: 'Publish a progress report (mark as reviewed, send to parent)' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'Report published' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async publishProgressReport(
    @Param('id') id: string,
    @Body() dto: PublishReportDto,
  ) {
    return this.reportsService.publishProgressReport(id, dto);
  }

  // ── School Reports ────────────────────────────────────────────────

  @Get('school')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'List school reports with filters' })
  @ApiResponse({ status: 200, description: 'List of school reports' })
  async getSchoolReports(@Query() filters: SchoolReportFilterDto) {
    return this.reportsService.getSchoolReports(filters);
  }

  @Post('school')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Generate a school report' })
  @ApiResponse({ status: 201, description: 'School report created' })
  async createSchoolReport(@Body() dto: CreateSchoolReportDto) {
    return this.reportsService.createSchoolReport(dto);
  }

  @Get('school/:id/download')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Download school report as PDF' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  @ApiResponse({ status: 200, description: 'PDF download' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async downloadSchoolReport(@Param('id') id: string) {
    return this.reportsService.downloadSchoolReport(id);
  }
}
