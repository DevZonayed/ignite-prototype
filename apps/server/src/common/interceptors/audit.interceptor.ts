import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuditService } from '../../modules/audit/audit.service';
import { AuditResult } from '../../database/entities/audit-log.entity';

/**
 * Records every action taken against the API.
 *
 * This runs globally rather than per-service on purpose: an audit trail that
 * depends on each new endpoint remembering to call it is an audit trail with
 * holes in it, and the holes are invisible until somebody needs the record.
 *
 * Three rules it holds to:
 *
 *  - It never changes the outcome of a request. The write is fire-and-forget
 *    and its failures are swallowed; auditing must not be able to take the
 *    platform down.
 *  - It never stores a credential. Bodies pass through `redact()` first.
 *  - It never logs itself. Reading the audit log would otherwise append to the
 *    audit log, which makes the page unreadable and grows without bound.
 */

/** Keys whose values are replaced wholesale, matched case-insensitively. */
const SECRET_KEYS = [
  'password',
  'newpassword',
  'currentpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'otp',
  'code',
  'authorization',
  'apikey',
];

/** Paths that would otherwise bury real activity under polling noise. */
const SKIP_PREFIXES = ['/api/audit', '/api/monitoring'];

const MAX_BODY_CHARS = 4000;

function isSecretKey(key: string): boolean {
  const k = key.toLowerCase();
  return SECRET_KEYS.some((s) => k === s || k.includes(s));
}

/**
 * Deep-copies a value, replacing anything that looks like a credential. Depth
 * is capped because request bodies are user-supplied and could nest forever.
 */
function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > 6) return '[deep]';

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((v) => redact(v, depth + 1));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = isSecretKey(k) ? '[redacted]' : redact(v, depth + 1);
    }
    return out;
  }

  return value;
}

function serialise(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return undefined;
  }

  try {
    const json = JSON.stringify(redact(value));
    if (!json || json === '{}') return undefined;
    return json.length > MAX_BODY_CHARS
      ? json.slice(0, MAX_BODY_CHARS) + '…[truncated]'
      : json;
  } catch {
    return undefined;
  }
}

/**
 * Turns a request into a name a person can scan in a list: `users.create`,
 * `schools.update`, `auth.signin`. Ids in the path are collapsed so that a
 * thousand different rows do not become a thousand different event names.
 */
/**
 * Path tails that are already an action. `POST /auth/signin` is a sign-in, not
 * the creation of a signin, and `auth.signin.create` reads like a bug.
 */
const ACTION_SEGMENTS = new Set([
  'signin',
  'signout',
  'signup',
  'refresh',
  'activate',
  'bootstrap',
  'forgot-password',
  'reset-password',
  'change-password',
  'resend',
  'verify',
  'export',
  'import',
  'generate',
  'assign',
  'publish',
  'restore',
  'suspend',
  'sync',
]);

function eventName(method: string, path: string): string {
  const segments = path
    .replace(/^\/api\/?/, '')
    .split('?')[0]
    .split('/')
    .filter(Boolean)
    .filter((s) => !isIdish(s));

  const resource = segments.join('.') || 'root';

  if (segments.length && ACTION_SEGMENTS.has(segments[segments.length - 1])) {
    return resource;
  }

  const verb =
    {
      POST: 'create',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
      GET: 'read',
    }[method] ?? method.toLowerCase();

  return `${resource}.${verb}`;
}

function isIdish(segment: string): boolean {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment,
    ) || /^\d+$/.test(segment)
  );
}

function idFromPath(path: string): string | null {
  const segments = path.replace(/^\/api\/?/, '').split('?')[0].split('/');
  const id = segments.find(isIdish);
  return id ?? null;
}

/**
 * Digs the signed-in user out of a response body. Only sign-in and activation
 * return one, which is exactly where `request.user` is missing.
 *
 * Runs before TransformInterceptor wraps the body, so the shape here is what
 * the handler returned, not the `{ data, meta }` envelope the client sees —
 * both are checked so this keeps working if that order ever changes.
 */
function resolveActorFromPayload(payload: unknown): any | null {
  if (!payload || typeof payload !== 'object') return null;

  const body = payload as Record<string, any>;
  const user = body.user ?? body.data?.user ?? null;

  return user && typeof user === 'object' && user.id ? user : null;
}

/**
 * Which app made the call. The Origin header is authoritative when present;
 * the mobile apps do not send one, so their role is the next best signal.
 */
function resolveSource(origin: string | undefined, role: string | null): string {
  if (origin) {
    if (origin.includes('admin')) return 'admin-portal';
    if (origin.includes('school')) return 'school-portal';
  }

  switch (role) {
    case 'platform_admin':
      return 'admin-portal';
    case 'principal':
      return 'school-portal';
    case 'teacher':
      return 'teacher-app';
    case 'learner':
      return 'learner-app';
    case 'parent':
      return 'parent-app';
    default:
      return origin ? 'web' : 'api';
  }
}

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

    if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return next.handle();
    if (method === 'OPTIONS') return next.handle();
    if (method === 'GET' && !this.logReads) return next.handle();

    const startedAt = Date.now();

    return next.handle().pipe(
      tap((payload) => {
        this.write(request, method, path, startedAt, {
          statusCode: http.getResponse()?.statusCode ?? 200,
          result: AuditResult.OK,
          errorMessage: undefined,
          payload,
        });
      }),
      catchError((error) => {
        const statusCode = error?.status ?? error?.statusCode ?? 500;

        this.write(request, method, path, startedAt, {
          statusCode,
          // 401/403 is somebody being turned away, which is the single most
          // interesting thing in a security log. It is not the same as a crash.
          result:
            statusCode === 401 || statusCode === 403
              ? AuditResult.BLOCKED
              : AuditResult.FAILED,
          errorMessage:
            typeof error?.message === 'string'
              ? error.message.slice(0, 500)
              : undefined,
        });

        return throwError(() => error);
      }),
    );
  }

  private write(
    request: any,
    method: string,
    path: string,
    startedAt: number,
    outcome: {
      statusCode: number;
      result: AuditResult;
      errorMessage: string | undefined;
      payload?: unknown;
    },
  ): void {
    // Sign-in is the entry the security log most needs to name, and it is the
    // one request where nobody is authenticated yet — `request.user` is unset
    // because the route is @Public. So the actor is recovered from the two
    // other places it exists: the user the endpoint just returned, or (when
    // the attempt failed) the identifier the caller typed.
    const user = request.user ?? resolveActorFromPayload(outcome.payload) ?? null;
    const role = user?.role ?? null;

    const attemptedIdentifier =
      !user && typeof request.body?.identifier === 'string'
        ? request.body.identifier
        : null;

    const actorName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.email ||
        null
      : null;

    void this.auditService
      .record({
        event: eventName(method, path),
        actorId: user?.id ?? null,
        actorName: actorName ?? (attemptedIdentifier ? `${attemptedIdentifier} (attempted)` : null),
        actorEmail: user?.email ?? attemptedIdentifier ?? null,
        actorRole: role,
        actorSchoolId: user?.schoolId ?? null,
        source: resolveSource(request.headers?.origin, role),
        target: `${method} ${path.split('?')[0]}`,
        targetType:
          path.replace(/^\/api\/?/, '').split('/').filter(Boolean)[0] ?? null,
        targetId: idFromPath(path) ?? undefined,
        method,
        path: path.split('?')[0],
        statusCode: outcome.statusCode,
        durationMs: Date.now() - startedAt,
        // Behind Traefik the socket address is the proxy, so the forwarded
        // header is the only place the caller's real address survives.
        ip:
          (request.headers?.['x-forwarded-for'] ?? '')
            .toString()
            .split(',')[0]
            .trim() ||
          request.ip ||
          request.socket?.remoteAddress ||
          undefined,
        userAgent: request.headers?.['user-agent'] ?? null,
        requestQuery: serialise(request.query),
        requestBody: method === 'GET' ? undefined : serialise(request.body),
        errorMessage: outcome.errorMessage,
        result: outcome.result,
      })
      .catch(() => {
        /* An audit write must never surface as a failed request. */
      });
  }
}
