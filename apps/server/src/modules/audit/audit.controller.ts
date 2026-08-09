import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditFilterDto } from './dto/audit-filter.dto';

@ApiTags('audit')
@ApiBearerAuth('bearer')
@Controller('audit')
@Roles('platform_admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of audit log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async findAll(@Query() filters: AuditFilterDto) {
    // Default to last 7 days if no dates specified
    if (!filters.startDate && !filters.endDate) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filters.startDate = sevenDaysAgo.toISOString();
      filters.endDate = now.toISOString();
    }

    return this.auditService.findAll(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create an audit log entry (internal)' })
  @ApiResponse({ status: 201, description: 'Audit log entry created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async create(@Body() dto: CreateAuditLogDto) {
    return this.auditService.create(dto);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit log entries (no pagination)' })
  @ApiResponse({ status: 200, description: 'All matching audit log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async export(@Query() filters: AuditFilterDto) {
    return this.auditService.export(filters);
  }
}
