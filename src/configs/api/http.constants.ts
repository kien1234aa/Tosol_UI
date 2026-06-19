/** Default HTTP timeout for API calls. */
export const HTTP_REQUEST_TIMEOUT_MS = 30_000;

/** Max retry attempts for idempotent requests (GET/HEAD/DELETE). */
export const HTTP_RETRY_MAX_ATTEMPTS = 3;

/** Base delay before the first retry. */
export const HTTP_RETRY_BASE_DELAY_MS = 500;

/** API version sent to the backend for forward-compatible routing. */
export const API_VERSION = '1';

/** HTTP statuses that may be retried for safe methods. */
export const HTTP_RETRYABLE_STATUS_CODES = new Set([
  408, 429, 500, 502, 503, 504,
]);

/** Methods safe to retry automatically. */
export const HTTP_RETRYABLE_METHODS = new Set(['GET', 'HEAD', 'DELETE']);

/** Seconds subtracted from token lifetime before treating it as expired. */
export const TOKEN_EXPIRY_BUFFER_SECONDS = 60;
