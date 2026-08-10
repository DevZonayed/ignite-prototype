import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AssignCurriculumDto } from './dto/assign-curriculum.dto';

@ApiTags('curriculum')
@ApiBearerAuth('bearer')
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get('coverage')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Curriculum coverage per class (lessons delivered vs total)' })
  @ApiResponse({ status: 200, description: 'Coverage breakdown by class' })
  async getCoverage(@Query('schoolId') schoolId?: string) {
    return this.curriculumService.getCoverage(schoolId);
  }

  @Get()
  @Roles('platform_admin', 'curriculum_admin', 'principal', 'teacher')
  @ApiOperation({ summary: 'List all curriculum versions' })
  @ApiResponse({ status: 200, description: 'List of curriculum versions' })
  async findAll(@CurrentUser() user: any) {
    return this.curriculumService.findAll(user);
  }

  @Post()
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Create a new draft curriculum version' })
  @ApiResponse({ status: 201, description: 'Curriculum version created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateCurriculumDto) {
    return this.curriculumService.create(dto);
  }

  @Get(':id')
  @Roles('platform_admin', 'curriculum_admin', 'principal', 'teacher')
  @ApiOperation({ summary: 'Get full curriculum with units and lessons tree' })
  @ApiParam({ name: 'id', description: 'Curriculum version UUID' })
  @ApiResponse({ status: 200, description: 'Full curriculum tree' })
  @ApiResponse({ status: 404, description: 'Curriculum version not found' })
  async findOne(@Param('id') id: string) {
    return this.curriculumService.findById(id);
  }

  @Put(':id/publish')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Publish a curriculum version' })
  @ApiParam({ name: 'id', description: 'Curriculum version UUID' })
  @ApiResponse({ status: 200, description: 'Curriculum version published' })
  @ApiResponse({ status: 404, description: 'Curriculum version not found' })
  @ApiResponse({ status: 409, description: 'Curriculum version already published' })
  async publish(@Param('id') id: string) {
    return this.curriculumService.publish(id);
  }

  @Post(':id/assign')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Assign a published curriculum to schools' })
  @ApiParam({ name: 'id', description: 'Curriculum version UUID' })
  @ApiResponse({ status: 201, description: 'Curriculum assigned to schools' })
  @ApiResponse({ status: 404, description: 'Curriculum version not found' })
  @ApiResponse({ status: 409, description: 'Cannot assign a draft curriculum' })
  async assignToSchools(
    @Param('id') id: string,
    @Body() dto: AssignCurriculumDto,
  ) {
    return this.curriculumService.assignToSchools(id, dto);
  }

  @Post(':id/units')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Add a unit to a curriculum version' })
  @ApiParam({ name: 'id', description: 'Curriculum version UUID' })
  @ApiResponse({ status: 201, description: 'Unit added to curriculum' })
  @ApiResponse({ status: 404, description: 'Curriculum version not found' })
  @ApiResponse({ status: 409, description: 'Curriculum version is immutable' })
  async addUnit(@Param('id') id: string, @Body() dto: CreateUnitDto) {
    return this.curriculumService.addUnit(id, dto);
  }

  @Patch(':id/units/:unitId')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update a unit within a curriculum version' })
  @ApiParam({ name: 'id', description: 'Curriculum version UUID' })
  @ApiParam({ name: 'unitId', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit updated' })
  @ApiResponse({ status: 404, description: 'Curriculum or unit not found' })
  @ApiResponse({ status: 409, description: 'Curriculum version is immutable' })
  async updateUnit(
    @Param('id') id: string,
    @Param('unitId') unitId: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.curriculumService.updateUnit(id, unitId, dto);
  }

  @Delete(':id/units/:unitId')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Delete a unit from a curriculum version' })
  @ApiParam({ name: 'id', description: 'Curriculum version UUID' })
  @ApiParam({ name: 'unitId', description: 'Unit UUID' })
  @ApiResponse({ status: 200, description: 'Unit deleted' })
  @ApiResponse({ status: 404, description: 'Curriculum or unit not found' })
  @ApiResponse({ status: 409, description: 'Curriculum version is immutable' })
  async deleteUnit(
    @Param('id') id: string,
    @Param('unitId') unitId: string,
  ) {
    await this.curriculumService.deleteUnit(id, unitId);
    return { deleted: true };
  }
}
