import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { LessonSessionsService } from './lesson-sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';

@ApiTags('lesson-sessions')
@ApiBearerAuth('bearer')
@Controller('lesson-sessions')
export class LessonSessionsController {
  constructor(private readonly lessonSessionsService: LessonSessionsService) {}

  // Only the teacher delivering the lesson opens/updates a session — these
  // records feed the 'lessons delivered' metrics, so anyone may not write them.
  @Post()
  @Roles('teacher', 'platform_admin')
  @ApiOperation({ summary: 'Start a new lesson session' })
  @ApiResponse({ status: 201, description: 'Lesson session created' })
  @ApiResponse({ status: 409, description: 'Active session already exists' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async create(
    @Body() dto: CreateSessionDto,
    @CurrentUser() user: User,
  ) {
    return this.lessonSessionsService.create(dto, user.id);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active session for the authenticated teacher' })
  @ApiResponse({ status: 200, description: 'Current active session or null' })
  async findCurrent(@CurrentUser() user: User) {
    return this.lessonSessionsService.findCurrentForTeacher(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session detail with timer data' })
  @ApiParam({ name: 'id', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session details with lesson and class relations' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findOne(@Param('id') id: string) {
    return this.lessonSessionsService.findById(id);
  }

  @Patch(':id')
  @Roles('teacher', 'platform_admin')
  @ApiOperation({ summary: 'Update session (pause/resume, elapsed time, sync status)' })
  @ApiParam({ name: 'id', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session updated' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.lessonSessionsService.update(id, dto);
  }

  @Patch(':id/complete')
  @Roles('teacher', 'platform_admin')
  @ApiOperation({ summary: 'Mark session as complete' })
  @ApiParam({ name: 'id', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session marked as complete' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteSessionDto,
  ) {
    return this.lessonSessionsService.complete(id, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get session stats (attendance, activities, rubric, assessments)' })
  @ApiParam({ name: 'id', description: 'Lesson session UUID' })
  @ApiResponse({ status: 200, description: 'Session statistics' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getStats(@Param('id') id: string) {
    return this.lessonSessionsService.getStats(id);
  }
}
