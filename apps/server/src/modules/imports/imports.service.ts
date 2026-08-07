import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { ColumnMappingDto } from './dto/column-mapping.dto';
import { FixErrorRowDto } from './dto/fix-error-row.dto';

/**
 * Stub import-job record used until a dedicated ImportJob entity is created.
 */
export interface ImportJobRecord {
  id: string;
  status: 'pending' | 'validating' | 'validated' | 'importing' | 'completed' | 'failed';
  fileName: string;
  rowCount: number;
  mapping?: Record<string, string>;
  validationResults?: {
    valid: number;
    errors: { row: number; field: string; message: string }[];
  };
  importResults?: { imported: number; skipped: number };
  uploadedById: string;
  createdAt: string;
}

@Injectable()
export class ImportsService {
  /** In-memory store — replaced by TypeORM repository once entity exists. */
  private readonly jobs: ImportJobRecord[] = [];

  /**
   * Returns a CSV template with expected headers and a sample row.
   */
  async getTemplate(): Promise<{
    headers: string[];
    sampleRow: Record<string, string>;
  }> {
    const headers = ['firstName', 'lastName', 'email', 'role', 'schoolId'];
    const sampleRow: Record<string, string> = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@school.org',
      role: 'learner',
      schoolId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    };

    return { headers, sampleRow };
  }

  /**
   * Creates a new import job from an uploaded CSV file.
   */
  async uploadCsv(
    file: Express.Multer.File,
    uploadedById: string,
  ): Promise<{
    id: string;
    status: string;
    fileName: string;
    rowCount: number;
  }> {
    const rowCount = file.buffer
      .toString('utf-8')
      .split('\n')
      .filter((line) => line.trim().length > 0).length - 1; // subtract header row

    const job: ImportJobRecord = {
      id: uuidv4(),
      status: 'pending',
      fileName: file.originalname,
      rowCount: Math.max(rowCount, 0),
      uploadedById,
      createdAt: new Date().toISOString(),
    };

    this.jobs.push(job);

    return {
      id: job.id,
      status: job.status,
      fileName: job.fileName,
      rowCount: job.rowCount,
    };
  }

  /**
   * Returns the current status and validation results for an import job.
   */
  async getJobStatus(id: string): Promise<ImportJobRecord> {
    const job = this.jobs.find((j) => j.id === id);
    if (!job) {
      throw new NotFoundException(`Import job with ID "${id}" not found`);
    }
    return job;
  }

  /**
   * Saves the column mapping for an import job.
   */
  async saveColumnMapping(
    id: string,
    dto: ColumnMappingDto,
  ): Promise<ImportJobRecord> {
    const job = await this.getJobStatus(id);
    job.mapping = dto.mapping;
    return job;
  }

  /**
   * Runs validation on the import job rows, returning valid count and errors.
   */
  async validate(
    id: string,
  ): Promise<{
    valid: number;
    errors: { row: number; field: string; message: string }[];
  }> {
    const job = await this.getJobStatus(id);
    job.status = 'validating';

    // Stub validation — all rows pass
    const results = { valid: job.rowCount, errors: [] as { row: number; field: string; message: string }[] };
    job.validationResults = results;
    job.status = 'validated';

    return results;
  }

  /**
   * Imports validated rows. Returns counts of imported and skipped records.
   */
  async runImport(
    id: string,
  ): Promise<{ imported: number; skipped: number }> {
    const job = await this.getJobStatus(id);
    job.status = 'importing';

    // Stub import — all valid rows succeed
    const errorCount = job.validationResults?.errors.length ?? 0;
    const results = {
      imported: job.rowCount - errorCount,
      skipped: errorCount,
    };

    job.importResults = results;
    job.status = 'completed';

    return results;
  }

  /**
   * Fixes a single error row with corrected data.
   */
  async fixErrorRow(
    id: string,
    row: number,
    dto: FixErrorRowDto,
  ): Promise<{ row: number; correctedData: Record<string, string> }> {
    const job = await this.getJobStatus(id);

    if (job.validationResults) {
      job.validationResults.errors = job.validationResults.errors.filter(
        (e) => e.row !== row,
      );
    }

    return { row, correctedData: dto.correctedData };
  }
}
