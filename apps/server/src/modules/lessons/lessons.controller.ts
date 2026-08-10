import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateLessonStatusDto } from './dto/update-lesson-status.dto';
import { CreateLessonMediaDto } from './dto/create-lesson-media.dto';
import { LessonFilterDto } from './dto/lesson-filter.dto';

@ApiTags('lessons')
@ApiBearerAuth('bearer')
@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('lessons')
  @ApiOperation({ summary: 'List lessons with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of lessons' })
  async findAll(@Query() filters: LessonFilterDto) {
    return this.lessonsService.findAll(filters);
  }

  @Post('curriculum/:currId/units/:unitId/lessons')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Create a new lesson within a unit' })
  @ApiParam({ name: 'currId', description: 'Curriculum version UUID' })
  @ApiParam({ name: 'unitId', description: 'Unit UUID' })
  @ApiResponse({ status: 201, description: 'Lesson created' })
  @ApiResponse({ status: 400, description: 'Unit does not belong to curriculum' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async create(
    @Param('currId') currId: string,
    @Param('unitId') unitId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.create(currId, unitId, dto);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get full lesson detail with all relations' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Full lesson detail' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }

  @Patch('lessons/:id')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update a lesson (any section)' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Lesson updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(id, dto);
  }

  @Patch('lessons/:id/status')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update lesson status only' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Lesson status updated' })
  @ApiResponse({ status: 400, description: 'Unknown lesson status' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLessonStatusDto,
  ) {
    return this.lessonsService.updateStatus(id, dto.status);
  }

  @Post('lessons/:id/media')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Add media to a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 201, description: 'Media added to lesson' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async addMedia(@Param('id') id: string, @Body() dto: CreateLessonMediaDto) {
    return this.lessonsService.addMedia(id, dto);
  }

  @Delete('lessons/:id/media/:mediaId')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Remove media from a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiParam({ name: 'mediaId', description: 'Media UUID' })
  @ApiResponse({ status: 200, description: 'Media removed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async removeMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    await this.lessonsService.removeMedia(id, mediaId);
    return { deleted: true };
  }

  @Get('lessons/:id/media')
  @ApiOperation({ summary: 'Get lesson media grouped by category' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Media grouped by category' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getMedia(@Param('id') id: string) {
    return this.lessonsService.getMedia(id);
  }

  @Get('lessons/:id/steps')
  @ApiOperation({ summary: 'Get lesson steps ordered by step number' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Ordered list of lesson steps' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getSteps(@Param('id') id: string) {
    return this.lessonsService.getSteps(id);
  }

  @Get('lessons/:id/activities')
  @ApiOperation({ summary: 'Get lesson activity checklist ordered by index' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({ status: 200, description: 'Ordered list of lesson activities' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getActivities(@Param('id') id: string) {
    return this.lessonsService.getActivities(id);
  }

  @Patch('lessons/:id/activities/:activityId')
  @Roles('platform_admin', 'curriculum_admin', 'teacher')
  @ApiOperation({ summary: 'Toggle activity completion' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiParam({ name: 'activityId', description: 'Activity UUID' })
  @ApiResponse({ status: 200, description: 'Activity toggled' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async toggleActivity(
    @Param('id') id: string,
    @Param('activityId') activityId: string,
  ) {
    return this.lessonsService.toggleActivity(id, activityId);
  }
}
