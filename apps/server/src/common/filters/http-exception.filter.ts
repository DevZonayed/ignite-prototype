import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuditService } from '../../modules/audit/audit.service';
import { AuditResult } from '../../database/entities/audit-log.entity';
import { buildAuditEntry } from '../audit/audit-entry';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Optional so the filter still works when constructed by hand (tests, or
   * `useGlobalFilters`) without an injector to supply the service.
   */
  constructor(
    @Optional() private readonly auditService?: AuditService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;
        error = responseObj.error || HttpStatus[statusCode] || 'Error';
      } else {
        message = exception.message;
        error = HttpStatus[statusCode] || 'Error';
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log unexpected errors with stack trace
      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.audit(request, statusCode, message);

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Every failed request is an audit entry, including the ones a guard refused
   * before the handler ran. 401 and 403 are recorded as `blocked` rather than
   * `failed`: somebody being turned away is a different event from something
   * breaking, and it is the one the security log is really for.
   *
   * Unlike the success path, /audit and /monitoring are not exempt here — a
   * refused read of the audit log is exactly what must not go unrecorded.
   */
  private audit(
    request: Request,
    statusCode: number,
    message: string | string[],
  ): void {
    if (!this.auditService) return;

    void this.auditService
      .record(
        buildAuditEntry(request, {
          statusCode,
          result:
            statusCode === 401 || statusCode === 403
              ? AuditResult.BLOCKED
              : AuditResult.FAILED,
          errorMessage: (Array.isArray(message) ? message.join('; ') : message)
            ?.toString()
            .slice(0, 500),
        }),
      )
      .catch(() => {
        /* An audit write must never mask the error being returned. */
      });
  }
}
