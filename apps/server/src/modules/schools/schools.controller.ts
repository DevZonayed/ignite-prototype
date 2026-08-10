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
import { School } from '../../database/entities/school.entity';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolFilterDto } from './dto/school-filter.dto';

@ApiTags('schools')
@ApiBearerAuth('bearer')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'List all schools with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of schools' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async findAll(@Query() filters: SchoolFilterDto) {
    return this.schoolsService.findAll(filters);
  }

  @Post()
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Create a new school' })
  @ApiResponse({ status: 201, description: 'School created successfully' })
  @ApiResponse({ status: 409, description: 'School with this name already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Get(':id')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Get school details by ID' })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'School details with relations' })
  @ApiResponse({ status: 404, description: 'School not found' })
  async findOne(@Param('id') id: string) {
    return this.schoolsService.findById(id);
  }

  @Patch(':id')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Update a school' })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'School updated successfully' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 409, description: 'School with this name already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('platform_admin')
  @ApiOperation({
    summary: 'Delete a school',
    description:
      'Refused while the school still has classes or learners. Remaining staff accounts are detached from the school rather than deleted.',
  })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'School deleted' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 409, description: 'School still has classes or learners' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }

  @Get(':id/dashboard')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics for a school' })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({ status: 404, description: 'School not found' })
  async getDashboard(@Param('id') id: string) {
    return this.schoolsService.getDashboard(id);
  }

  @Get(':id/users')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'List users belonging to a school' })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'List of users at this school' })
  @ApiResponse({ status: 404, description: 'School not found' })
  async getUsers(@Param('id') id: string) {
    return this.schoolsService.getUsers(id);
  }

  @Get(':id/settings')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Get school settings' })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'School settings' })
  @ApiResponse({ status: 404, description: 'School not found' })
  async getSettings(@Param('id') id: string) {
    return this.schoolsService.getSettings(id);
  }

  @Patch(':id/settings')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Update school settings' })
  @ApiParam({ name: 'id', description: 'School UUID' })
  @ApiResponse({ status: 200, description: 'School settings updated' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async updateSettings(
    @Param('id') id: string,
    @Body() settings: Partial<School>,
  ) {
    return this.schoolsService.updateSettings(id, settings);
  }
}
