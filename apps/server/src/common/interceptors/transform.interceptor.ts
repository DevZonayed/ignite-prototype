import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    path: string;
    statusCode: number;
  };
}

/** Fields that must never appear in API responses. */
const SENSITIVE_FIELDS = [
  'passwordHash',
  'otpCode',
  'otpExpiresAt',
  'resetToken',
  'resetTokenExpiresAt',
  'rememberToken',
];

/**
 * Recursively strip sensitive fields from any object/array before it
 * reaches the client. Handles nested objects and arrays of objects.
 */
function stripSensitive(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(stripSensitive);
  if (typeof value === 'object' && value.constructor !== Date) {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_FIELDS.includes(key)) continue;
      cleaned[key] = stripSensitive(val);
    }
    return cleaned;
  }
  return value;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        data: stripSensitive(data),
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
          statusCode: response.statusCode,
        },
      })),
    );
  }
}
