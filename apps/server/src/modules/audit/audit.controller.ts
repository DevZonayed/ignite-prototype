import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
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
    // No implicit date window. This used to default to the last 7 days when no
    // dates were given, which meant a search for an event from last month
    // returned nothing and looked like the action was never logged. The caller
    // asks for the range it wants.
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

  @Get('facets')
  @ApiOperation({ summary: 'Distinct values available to filter on' })
  @ApiResponse({ status: 200, description: 'Events, roles, sources, methods and actors' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async facets() {
    return this.auditService.facets();
  }

  // Declared last on purpose: ':id' would otherwise swallow '/export' and
  // '/facets' before their own handlers are reached.
  @Get(':id')
  @ApiOperation({ summary: 'One audit entry in full, including request detail' })
  @ApiResponse({ status: 200, description: 'The audit entry' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'No such entry' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findOne(id);
  }
}
