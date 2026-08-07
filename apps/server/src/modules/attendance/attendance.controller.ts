import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, SaveSessionAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { HeatmapQueryDto } from './dto/heatmap-query.dto';
import { TrendQueryDto } from './dto/trend-query.dto';

@ApiTags('attendance')
@ApiBearerAuth('bearer')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'List attendance records with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of attendance records' })
  async findAll(@Query() filters: AttendanceFilterDto) {
    return this.attendanceService.findAll(filters);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk mark attendance for a session (upsert)' })
  @ApiResponse({ status: 201, description: 'Attendance records created or updated' })
  @ApiResponse({ status: 404, description: 'Lesson session not found' })
  async bulkMark(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.bulkMark(dto.lessonSessionId, dto.records);
  }

  @Put('session/:sessionId')
  @ApiOperation({ summary: 'Save/replace all attendance for a session' })
  @ApiParam({ name: 'sessionId', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session attendance saved' })
  @ApiResponse({ status: 404, description: 'Lesson session not found' })
  async saveSessionAttendance(
    @Param('sessionId') sessionId: string,
    @Body() dto: SaveSessionAttendanceDto,
  ) {
    return this.attendanceService.saveSessionAttendance(sessionId, dto.records);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get attendance for a specific session with learner details' })
  @ApiParam({ name: 'sessionId', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session attendance records with learner details' })
  @ApiResponse({ status: 404, description: 'Lesson session not found' })
  async getSessionAttendance(@Param('sessionId') sessionId: string) {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Heat-map data: week x class matrix with attendance percentages' })
  @ApiResponse({ status: 200, description: 'Heatmap data by class and week' })
  async getHeatmap(@Query() query: HeatmapQueryDto) {
    return this.attendanceService.getHeatmap(query);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Attendance trend over weeks' })
  @ApiResponse({ status: 200, description: 'Weekly attendance trend percentages' })
  async getTrend(@Query() query: TrendQueryDto) {
    return this.attendanceService.getTrend(query);
  }

  @Get('assessment-distribution')
  @ApiOperation({ summary: 'Distribution of assessment levels (placeholder)' })
  @ApiResponse({ status: 200, description: 'Assessment distribution counts' })
  async getAssessmentDistribution(
    @Query('schoolId') schoolId: string,
    @Query('term') term?: string,
  ) {
    return this.attendanceService.getAssessmentDistribution(schoolId, term);
  }

  @Get('learner/:learnerId')
  @ApiOperation({ summary: 'Attendance history for a specific learner' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner attendance history' })
  async getLearnerAttendance(@Param('learnerId') learnerId: string) {
    return this.attendanceService.getLearnerAttendance(learnerId);
  }

  @Get('class/:classId/weekly')
  @ApiOperation({ summary: 'Weekly attendance for a class' })
  @ApiParam({ name: 'classId', description: 'Class UUID' })
  @ApiResponse({ status: 200, description: 'Weekly attendance breakdown for the class' })
  async getClassWeeklyAttendance(@Param('classId') classId: string) {
    return this.attendanceService.getClassWeeklyAttendance(classId);
  }
}
