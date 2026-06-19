export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'VALIDATION'
  | 'UNKNOWN';

export interface HttpRequestOptions {
  baseUrl?: string;
  signal?: AbortSignal;
  /** Skip Bearer token (login/public endpoints). */
  skipAuth?: boolean;
  /** Disable automatic retry for this call. */
  skipRetry?: boolean;
  timeoutMs?: number;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string | string[]>;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}
