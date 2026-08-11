import { DeepPartial } from 'typeorm';

import {
  AuditLog,
  AuditResult,
} from '../../database/entities/audit-log.entity';

/**
 * Turns a request plus its outcome into an audit row.
 *
 * Shared because a request can end in two different places and both have to be
 * recorded: successes come back through `AuditInterceptor`, while failures are
 * caught by `HttpExceptionFilter`. Guards run *before* interceptors, so a
 * rejection by `RolesGuard` or `JwtAuthGuard` never reaches the interceptor at
 * all — the filter is the only hook that sees it, and being turned away is
 * exactly what a security log exists to record.
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

/**
 * Paths whose *successful* calls would bury real activity under polling noise
 * (and, for /api/audit, make reading the log append to the log). Failures on
 * them are still recorded.
 */
export const SUCCESS_EXEMPT_PREFIXES = ['/api/audit', '/api/monitoring'];

/** Where the request start time is stashed, for duration on either path. */
export const AUDIT_START = '__auditStartedAt';

const MAX_BODY_CHARS = 4000;

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

function isIdish(segment: string): boolean {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment,
    ) || /^\d+$/.test(segment)
  );
}

function idFromPath(path: string): string | null {
  const segments = path.replace(/^\/api\/?/, '').split('?')[0].split('/');
  return segments.find(isIdish) ?? null;
}

/**
 * A name a person can scan in a list: `users.create`, `auth.signin`. Ids are
 * collapsed so a thousand rows do not become a thousand event names.
 */
export function eventName(method: string, path: string): string {
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

/**
 * Digs the signed-in user out of a response body. Only sign-in and activation
 * return one, which is exactly where `request.user` is missing.
 */
function resolveActorFromPayload(payload: unknown): any | null {
  if (!payload || typeof payload !== 'object') return null;

  const body = payload as Record<string, any>;
  const user = body.user ?? body.data?.user ?? null;

  return user && typeof user === 'object' && user.id ? user : null;
}

export interface AuditOutcome {
  statusCode: number;
  result: AuditResult;
  errorMessage?: string;
  /** The handler's return value, used to name the actor on sign-in. */
  payload?: unknown;
}

export function buildAuditEntry(
  request: any,
  outcome: AuditOutcome,
): DeepPartial<AuditLog> {
  const path: string = request.originalUrl ?? request.url ?? '';
  const method: string = request.method ?? 'GET';
  const bare = path.split('?')[0];

  // Sign-in is the entry the security log most needs to name, and it is the
  // one request where nobody is authenticated yet — `request.user` is unset
  // because the route is @Public. So the actor is recovered from the user the
  // endpoint just returned, or from the identifier the caller typed.
  const user = request.user ?? resolveActorFromPayload(outcome.payload) ?? null;
  const role = user?.role ?? null;

  const attempted =
    !user && typeof request.body?.identifier === 'string'
      ? request.body.identifier
      : null;

  const actorName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email ||
      null
    : null;

  const startedAt = request[AUDIT_START];

  return {
    event: eventName(method, path),
    actorId: user?.id ?? null,
    actorName: actorName ?? (attempted ? `${attempted} (attempted)` : null),
    actorEmail: user?.email ?? attempted ?? null,
    actorRole: role,
    actorSchoolId: user?.schoolId ?? null,
    source: resolveSource(request.headers?.origin, role),
    target: `${method} ${bare}`,
    targetType: bare.replace(/^\/api\/?/, '').split('/').filter(Boolean)[0] ?? null,
    targetId: idFromPath(path) ?? undefined,
    method,
    path: bare,
    statusCode: outcome.statusCode,
    durationMs: typeof startedAt === 'number' ? Date.now() - startedAt : undefined,
    // Behind Traefik the socket address is the proxy, so the forwarded header
    // is the only place the caller's real address survives.
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
  };
}
