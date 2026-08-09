import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChildrenService } from './children.service';
import { ChildrenFilterDto } from './dto/children-filter.dto';
import { WeeklySummaryDto } from './dto/weekly-summary.dto';

@ApiTags('children')
@ApiBearerAuth('bearer')
@Controller()
@Roles('parent')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get('parents/me/children')
  @ApiOperation({ summary: 'List linked children for the authenticated parent' })
  @ApiResponse({ status: 200, description: 'Paginated list of linked children' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async listChildren(
    @CurrentUser('id') parentId: string,
    @Query() filters: ChildrenFilterDto,
  ) {
    return this.childrenService.findChildrenForParent(parentId, filters);
  }

  @Get('children/:id/weekly-summary')
  @ApiOperation({ summary: 'Get weekly activity summary for a child' })
  @ApiParam({ name: 'id', description: 'Child user UUID' })
  @ApiResponse({ status: 200, description: 'Weekly summary data', type: WeeklySummaryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getWeeklySummary(@Param('id') id: string) {
    return this.childrenService.getWeeklySummary(id);
  }

  @Get('children/:id/attendance')
  @ApiOperation({ summary: 'Get attendance data for a child' })
  @ApiParam({ name: 'id', description: 'Child user UUID' })
  @ApiResponse({ status: 200, description: 'Attendance term percentage and weekly breakdown' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getAttendance(@Param('id') id: string) {
    return this.childrenService.getAttendance(id);
  }

  @Get('children/:id/portfolio')
  @ApiOperation({ summary: "Get a child's portfolio items" })
  @ApiParam({ name: 'id', description: 'Child user UUID' })
  @ApiResponse({ status: 200, description: 'List of portfolio items (evidence, projects, certificates)' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getPortfolio(@Param('id') id: string) {
    return this.childrenService.getPortfolio(id);
  }

  @Get('children/:id/skills')
  @ApiOperation({ summary: "Get a child's skill dimensions with levels and overall LQS score" })
  @ApiParam({ name: 'id', description: 'Child user UUID' })
  @ApiResponse({ status: 200, description: 'Skill dimensions and overall LQS score' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getSkills(@Param('id') id: string) {
    return this.childrenService.getSkills(id);
  }

  @Get('children/:id/feed')
  @ApiOperation({ summary: 'Get action feed items for a child (homework, messages, reports)' })
  @ApiParam({ name: 'id', description: 'Child user UUID' })
  @ApiResponse({ status: 200, description: 'List of feed items with action-required flags' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getFeed(@Param('id') id: string) {
    return this.childrenService.getFeed(id);
  }
}
