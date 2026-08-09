import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { MonitoringService } from './monitoring.service';
import { MonitoringQueryDto } from './dto';

@ApiTags('monitoring')
@ApiBearerAuth()
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('dashboard')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Admin platform-wide dashboard (aggregate counts)' })
  @ApiResponse({ status: 200, description: 'Platform dashboard data' })
  async getPlatformDashboard() {
    return this.monitoringService.getPlatformDashboard();
  }

  @Get('stats')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Platform monitoring stats' })
  @ApiResponse({ status: 200, description: 'Monitoring stats returned' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getStats(@Query() query: MonitoringQueryDto) {
    return this.monitoringService.getStats(query.schoolId);
  }

  @Get('lessons-delivered')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Lessons delivered per day this week' })
  @ApiResponse({
    status: 200,
    description: 'Array of { day, count } for the requested week',
  })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getLessonsDelivered(@Query() query: MonitoringQueryDto) {
    return this.monitoringService.getLessonsDelivered(
      query.schoolId,
      query.week,
    );
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'System health check' })
  @ApiResponse({ status: 200, description: 'Health status returned' })
  async getHealth() {
    return this.monitoringService.getHealth();
  }
}
