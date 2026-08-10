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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassFilterDto } from './dto/class-filter.dto';
import { EnrolLearnersDto } from './dto/enrol-learners.dto';

@ApiTags('classes')
@ApiBearerAuth('bearer')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Roles('platform_admin', 'curriculum_admin', 'principal', 'teacher')
  @ApiOperation({ summary: 'List classes with optional filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of classes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async findAll(@Query() filters: ClassFilterDto, @CurrentUser() user: any) {
    return this.classesService.findAll(filters, user);
  }

  @Post()
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'School or teacher not found' })
  async create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get(':id')
  @Roles('platform_admin', 'curriculum_admin', 'principal', 'teacher')
  @ApiOperation({ summary: 'Get class details by ID' })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiResponse({ status: 200, description: 'Class details with school and teacher' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async findById(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  @Patch(':id')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Update an existing class' })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class, school, or teacher not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Get(':id/learners')
  @Roles('platform_admin', 'curriculum_admin', 'principal', 'teacher')
  @ApiOperation({ summary: 'Get learners enrolled in a class' })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiResponse({ status: 200, description: 'List of learners in the class' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getLearners(@Param('id') id: string) {
    return this.classesService.getLearners(id);
  }

  @Get(':id/enrollable-learners')
  @Roles('platform_admin', 'principal')
  @ApiOperation({
    summary: "Learners at this class's school who are not yet on any register",
  })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiResponse({ status: 200, description: 'List of unassigned learners' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getEnrollableLearners(@Param('id') id: string) {
    return this.classesService.getEnrollableLearners(id);
  }

  @Post(':id/learners')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Enrol learners into a class' })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiResponse({ status: 201, description: 'Updated class register' })
  @ApiResponse({ status: 400, description: 'Not a learner, or wrong school' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class or learner not found' })
  async enrolLearners(
    @Param('id') id: string,
    @Body() dto: EnrolLearnersDto,
  ) {
    return this.classesService.enrolLearners(id, dto.learnerIds);
  }

  @Delete(':id/learners/:learnerId')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Remove a learner from a class register' })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Updated class register' })
  @ApiResponse({ status: 400, description: 'Learner is not in this class' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class or learner not found' })
  async unenrolLearner(
    @Param('id') id: string,
    @Param('learnerId') learnerId: string,
  ) {
    return this.classesService.unenrolLearner(id, learnerId);
  }

  @Get(':id/attendance')
  @Roles('platform_admin', 'curriculum_admin', 'principal', 'teacher')
  @ApiOperation({ summary: 'Get attendance heatmap for a class over the last 4 weeks' })
  @ApiParam({ name: 'id', description: 'Class UUID' })
  @ApiResponse({ status: 200, description: 'Attendance heatmap data grouped by date' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getAttendanceHeatmap(@Param('id') id: string) {
    return this.classesService.getAttendanceHeatmap(id);
  }
}
