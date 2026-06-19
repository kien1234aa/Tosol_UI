import type { ApiErrorCode } from './http.types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: Record<string, string>,
    public readonly code: ApiErrorCode = 'UNKNOWN',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
