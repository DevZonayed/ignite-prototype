import {
  Body,
  Controller,
  Delete,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceFilterDto } from './dto/evidence-filter.dto';

@ApiTags('evidence')
@ApiBearerAuth('bearer')
@Controller('evidence')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  @ApiOperation({ summary: 'List evidence items with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of evidence items' })
  async findAll(@Query() filters: EvidenceFilterDto) {
    return this.evidenceService.findAll(filters);
  }

  @Post()
  @Roles('teacher')
  @ApiOperation({ summary: 'Upload evidence (photo/video/code captured during a lesson)' })
  @ApiResponse({ status: 201, description: 'Evidence created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async create(
    @Body() dto: CreateEvidenceDto,
    @CurrentUser('id') teacherId: string,
  ) {
    return this.evidenceService.create(dto, teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence detail with learner tags' })
  @ApiParam({ name: 'id', description: 'Evidence UUID' })
  @ApiResponse({ status: 200, description: 'Evidence details with tags' })
  @ApiResponse({ status: 404, description: 'Evidence not found' })
  async findOne(@Param('id') id: string) {
    return this.evidenceService.findById(id);
  }

  @Delete(':id')
  @Roles('teacher')
  @ApiOperation({ summary: 'Delete an evidence item' })
  @ApiParam({ name: 'id', description: 'Evidence UUID' })
  @ApiResponse({ status: 200, description: 'Evidence deleted' })
  @ApiResponse({ status: 404, description: 'Evidence not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async remove(@Param('id') id: string) {
    return this.evidenceService.remove(id);
  }

  @Post(':id/tags')
  @Roles('teacher')
  @ApiOperation({ summary: 'Tag learners on an evidence item' })
  @ApiParam({ name: 'id', description: 'Evidence UUID' })
  @ApiResponse({ status: 201, description: 'Learner tags created' })
  @ApiResponse({ status: 404, description: 'Evidence not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async addTags(
    @Param('id') id: string,
    @Body('learnerIds') learnerIds: string[],
  ) {
    return this.evidenceService.addTags(id, learnerIds);
  }

  @Delete(':id/tags/:learnerId')
  @Roles('teacher')
  @ApiOperation({ summary: 'Remove a specific learner tag from evidence' })
  @ApiParam({ name: 'id', description: 'Evidence UUID' })
  @ApiParam({ name: 'learnerId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Learner tag removed' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async removeTag(
    @Param('id') id: string,
    @Param('learnerId') learnerId: string,
  ) {
    return this.evidenceService.removeTag(id, learnerId);
  }
}
