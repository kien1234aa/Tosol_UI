import { ApiError, isApiError } from '@/src/apis/http/ApiError';
import type { ApiErrorCode } from '@/src/apis/http/http.types';
import { HTTP_RETRYABLE_STATUS_CODES } from '@/src/configs/api/http.constants';

export function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) {
    return '';
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function parseRetryAfterMs(headerValue: string | null): number | null {
  if (!headerValue) {
    return null;
  }

  const seconds = Number(headerValue);
  if (!Number.isNaN(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const retryAt = Date.parse(headerValue);
  if (!Number.isNaN(retryAt)) {
    return Math.max(0, retryAt - Date.now());
  }

  return null;
}

export function resolveApiErrorCode(status?: number): ApiErrorCode {
  if (status === 401) {
    return 'UNAUTHORIZED';
  }

  if (status === 403) {
    return 'FORBIDDEN';
  }

  if (status === 422 || status === 400) {
    return 'VALIDATION';
  }

  if (status === 429) {
    return 'RATE_LIMITED';
  }

  if (status != null && status >= 500) {
    return 'SERVER';
  }

  return 'UNKNOWN';
}

export function isRetryableHttpError(
  error: unknown,
  method: string,
  retryableMethods: Set<string>,
): boolean {
  if (!retryableMethods.has(method)) {
    return false;
  }

  if (isApiError(error) && error.status == null) {
    return error.code === 'NETWORK';
  }

  if (!isApiError(error) || error.status == null) {
    return false;
  }

  return HTTP_RETRYABLE_STATUS_CODES.has(error.status);
}

export function getRetryDelayMs(
  attempt: number,
  baseDelayMs: number,
  retryAfterMs?: number | null,
): number {
  if (retryAfterMs != null) {
    return retryAfterMs;
  }

  return baseDelayMs * 2 ** (attempt - 1);
}
