import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NestMiddleware,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuditService } from '../../modules/audit/audit.service';
import { AuditResult } from '../../database/entities/audit-log.entity';
import {
  AUDIT_START,
  SUCCESS_EXEMPT_PREFIXES,
  buildAuditEntry,
} from '../audit/audit-entry';

/**
 * Stamps the request so both the interceptor and the exception filter can
 * report how long the call took. It has to be a middleware because guards can
 * reject a request before any interceptor runs.
 */
@Injectable()
export class AuditTimingMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void): void {
    req[AUDIT_START] = Date.now();
    next();
  }
}

/**
 * Records every *successful* action taken against the API.
 *
 * Failures are recorded by `HttpExceptionFilter` instead — guards run before
 * interceptors, so a 401 from `JwtAuthGuard` or a 403 from `RolesGuard` never
 * reaches this class. Splitting it that way is what makes "somebody was turned
 * away" appear in the log at all.
 *
 * Two rules this holds to:
 *
 *  - It never changes the outcome of a request. The write is fire-and-forget
 *    and its failures are swallowed; auditing must not be able to take the
 *    platform down.
 *  - It never stores a credential. Bodies are redacted by `buildAuditEntry`.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Reads are logged too, so "who looked at this" is answerable and not just
   * "who changed it". That is a lot of rows on a busy day, so it can be turned
   * off with AUDIT_LOG_READS=false without losing the record of changes.
   */
  private get logReads(): boolean {
    return process.env.AUDIT_LOG_READS !== 'false';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest();
    const path: string = request.originalUrl ?? request.url ?? '';
    const method: string = request.method ?? 'GET';

    if (method === 'OPTIONS') return next.handle();
    if (method === 'GET' && !this.logReads) return next.handle();
    if (SUCCESS_EXEMPT_PREFIXES.some((p) => path.startsWith(p))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((payload) => {
        void this.auditService
          .record(
            buildAuditEntry(request, {
              statusCode: http.getResponse()?.statusCode ?? 200,
              result: AuditResult.OK,
              payload,
            }),
          )
          .catch(() => {
            /* An audit write must never surface as a failed request. */
          });
      }),
    );
  }
}
