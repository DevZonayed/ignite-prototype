import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('announcements')
@ApiBearerAuth('bearer')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'List announcements with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results per page',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Paginated list of announcements' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.announcementsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post()
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser('id') createdById: string,
  ) {
    return this.announcementsService.create(dto, createdById);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement details by ID' })
  @ApiParam({ name: 'id', description: 'Announcement UUID' })
  @ApiResponse({ status: 200, description: 'Announcement details' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async findOne(@Param('id') id: string) {
    return this.announcementsService.findById(id);
  }

  @Delete(':id')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiParam({ name: 'id', description: 'Announcement UUID' })
  @ApiResponse({ status: 200, description: 'Announcement deleted' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
