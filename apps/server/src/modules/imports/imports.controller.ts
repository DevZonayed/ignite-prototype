import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ImportsService } from './imports.service';
import { ColumnMappingDto } from './dto/column-mapping.dto';
import { FixErrorRowDto } from './dto/fix-error-row.dto';

@ApiTags('imports')
@ApiBearerAuth('bearer')
@Controller('imports')
@Roles('platform_admin', 'principal')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get('template')
  @ApiOperation({ summary: 'Download CSV import template' })
  @ApiResponse({ status: 200, description: 'CSV template with headers and sample row' })
  async getTemplate() {
    return this.importsService.getTemplate();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a CSV file for bulk import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV file to import' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'CSV uploaded and import job created' })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') uploadedById: string,
  ) {
    return this.importsService.uploadCsv(file, uploadedById);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import job status and results' })
  @ApiParam({ name: 'id', description: 'Import job UUID' })
  @ApiResponse({ status: 200, description: 'Import job details' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async getJobStatus(@Param('id') id: string) {
    return this.importsService.getJobStatus(id);
  }

  @Post(':id/map')
  @ApiOperation({ summary: 'Save column mapping for an import job' })
  @ApiParam({ name: 'id', description: 'Import job UUID' })
  @ApiResponse({ status: 201, description: 'Column mapping saved' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async saveColumnMapping(
    @Param('id') id: string,
    @Body() dto: ColumnMappingDto,
  ) {
    return this.importsService.saveColumnMapping(id, dto);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Run validation on import job rows' })
  @ApiParam({ name: 'id', description: 'Import job UUID' })
  @ApiResponse({ status: 201, description: 'Validation completed' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async validate(@Param('id') id: string) {
    return this.importsService.validate(id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run the import for validated rows' })
  @ApiParam({ name: 'id', description: 'Import job UUID' })
  @ApiResponse({ status: 201, description: 'Import completed' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async runImport(@Param('id') id: string) {
    return this.importsService.runImport(id);
  }

  @Patch(':id/errors/:row')
  @ApiOperation({ summary: 'Fix an individual error row' })
  @ApiParam({ name: 'id', description: 'Import job UUID' })
  @ApiParam({ name: 'row', description: 'Row number with the error' })
  @ApiResponse({ status: 200, description: 'Error row corrected' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async fixErrorRow(
    @Param('id') id: string,
    @Param('row', ParseIntPipe) row: number,
    @Body() dto: FixErrorRowDto,
  ) {
    return this.importsService.fixErrorRow(id, row, dto);
  }
}
