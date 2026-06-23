import { getApiBaseUrl } from '@/src/configs/api/api.environment';
import {
  API_VERSION,
  HTTP_REQUEST_TIMEOUT_MS,
  HTTP_RETRY_BASE_DELAY_MS,
  HTTP_RETRY_MAX_ATTEMPTS,
  HTTP_RETRYABLE_METHODS,
} from '@/src/configs/api/http.constants';
import { parseApiErrorBody } from '@/src/helpers/api/apiError.helpers';
import { localizeApiMessage } from '@/src/helpers/api/apiMessage.helpers';
import {
  buildQueryString,
  getRetryDelayMs,
  isRetryableHttpError,
  parseRetryAfterMs,
  resolveApiErrorCode,
  sleep,
} from '@/src/helpers/api/http.helpers';
import { isTokenExpired } from '@/src/helpers/api/session.helpers';
import { ApiError } from './ApiError';
import type {
  ApiEnvelope,
  HttpMethod,
  HttpRequestOptions,
  PaginationMeta,
} from './http.types';

export { ApiError } from './ApiError';
export type { PaginationMeta } from './http.types';
export type { ApiErrorCode, HttpRequestOptions } from './http.types';

const PUBLIC_API_PATHS = ['/login', '/forgot-password'] as const;

type InternalRequestOptions = HttpRequestOptions & {
  _retryAfterRefresh?: boolean;
};

type RequestContext = {
  method: HttpMethod;
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  options?: InternalRequestOptions;
  expectData: boolean;
  expectMeta: boolean;
  returnMessage?: boolean;
};

let authTokenGetter: (() => string | null) | null = null;
let tokenExpiresAtGetter: (() => number | null) | null = null;
let tokenRefreshHandler: (() => Promise<string | null>) | null = null;
let unauthorizedHandler: (() => void) | null = null;
let isHandlingUnauthorized = false;

export function setAuthTokenGetter(getter: () => string | null): void {
  authTokenGetter = getter;
}

export function setTokenExpiresAtGetter(getter: () => number | null): void {
  tokenExpiresAtGetter = getter;
}

export function setTokenRefreshHandler(
  handler: () => Promise<string | null>,
): void {
  tokenRefreshHandler = handler;
}

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

function isPublicPath(path: string): boolean {
  const normalizedPath = path.split('?')[0] ?? path;
  return PUBLIC_API_PATHS.some(
    publicPath => normalizedPath === publicPath,
  );
}

function shouldAttachAuth(path: string, options?: InternalRequestOptions): boolean {
  if (options?.skipAuth) {
    return false;
  }

  return !isPublicPath(path);
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function buildAuthHeaders(
  path: string,
  options?: InternalRequestOptions,
  hasBody = false,
  body?: unknown,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-API-Version': API_VERSION,
  };

  if (hasBody && !isFormDataBody(body)) {
    headers['Content-Type'] = 'application/json';
  }

  if (shouldAttachAuth(path, options)) {
    const token = authTokenGetter?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function triggerUnauthorized(): void {
  if (isHandlingUnauthorized || !unauthorizedHandler) {
    return;
  }

  isHandlingUnauthorized = true;

  try {
    unauthorizedHandler();
  } finally {
    setTimeout(() => {
      isHandlingUnauthorized = false;
    }, 0);
  }
}

async function ensureValidAuth(path: string, options?: InternalRequestOptions): Promise<void> {
  if (!shouldAttachAuth(path, options)) {
    return;
  }

  const expiresAt = tokenExpiresAtGetter?.();

  if (!isTokenExpired(expiresAt)) {
    return;
  }

  if (tokenRefreshHandler) {
    const refreshedToken = await tokenRefreshHandler();
    if (refreshedToken) {
      return;
    }
  }

  triggerUnauthorized();
  throw new ApiError(
    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    401,
    undefined,
    'UNAUTHORIZED',
  );
}

async function tryRefreshAndRetry<T>(
  context: RequestContext,
): Promise<T | null> {
  if (
    context.options?._retryAfterRefresh ||
    !tokenRefreshHandler ||
    !shouldAttachAuth(context.path, context.options)
  ) {
    return null;
  }

  const refreshedToken = await tokenRefreshHandler();
  if (!refreshedToken) {
    return null;
  }

  return executeRequest({
    ...context,
    options: {
      ...context.options,
      _retryAfterRefresh: true,
    },
  });
}

function isApiFailure(payload: ApiEnvelope<unknown>, response: Response): boolean {
  if (payload.success === false) {
    return true;
  }

  if (payload.success === true) {
    return false;
  }

  return !response.ok;
}

function throwApiError(body: unknown, status?: number): never {
  const { message, fieldErrors } = parseApiErrorBody(body);
  const code = resolveApiErrorCode(status);
  throw new ApiError(message, status, fieldErrors, code);
}

async function parseJsonResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(
      'Không thể kết nối đến máy chủ',
      response.status,
      undefined,
      resolveApiErrorCode(response.status),
    );
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const externalSignal = init.signal;

  if (externalSignal?.aborted) {
    clearTimeout(timeoutId);
    throw new ApiError('Yêu cầu đã bị hủy', undefined, undefined, 'UNKNOWN');
  }

  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onExternalAbort);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Yêu cầu quá thời gian chờ',
        undefined,
        undefined,
        'TIMEOUT',
      );
    }

    throw new ApiError(
      'Không thể kết nối đến máy chủ',
      undefined,
      undefined,
      'NETWORK',
    );
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

async function performRequest(context: RequestContext): Promise<Response> {
  const { method, path, body, params, options } = context;
  const baseUrl = options?.baseUrl ?? getApiBaseUrl();
  const url = `${baseUrl}${path}${buildQueryString(params)}`;
  const timeoutMs = options?.timeoutMs ?? HTTP_REQUEST_TIMEOUT_MS;
  const hasBody = body !== undefined;

  await ensureValidAuth(path, options);

  return fetchWithTimeout(
    url,
    {
      method,
      headers: buildAuthHeaders(path, options, hasBody, body),
      body: hasBody
        ? isFormDataBody(body)
          ? body
          : JSON.stringify(body)
        : undefined,
      signal: options?.signal,
    },
    timeoutMs,
  );
}

async function handleUnauthorizedResponse<T>(
  context: RequestContext,
  response: Response,
  payload: ApiEnvelope<T>,
): Promise<T> {
  const retried = await tryRefreshAndRetry<T>(context);
  if (retried != null) {
    return retried;
  }

  triggerUnauthorized();
  throwApiError(payload, response.status);
}

async function executeRequest<T>(context: RequestContext): Promise<T> {
  const maxAttempts = context.options?.skipRetry
    ? 1
    : HTTP_RETRY_MAX_ATTEMPTS;

  let lastRetryAfterMs: number | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await performRequest(context);
      const payload = await parseJsonResponse<T>(response);

      if (response.status === 401 && shouldAttachAuth(context.path, context.options)) {
        return handleUnauthorizedResponse(context, response, payload);
      }

      if (isApiFailure(payload, response)) {
        if (
          response.status === 429 &&
          attempt < maxAttempts &&
          !context.options?.skipRetry
        ) {
          lastRetryAfterMs = parseRetryAfterMs(
            response.headers.get('Retry-After'),
          );
          const delayMs = getRetryDelayMs(
            attempt,
            HTTP_RETRY_BASE_DELAY_MS,
            lastRetryAfterMs,
          );
          await sleep(delayMs);
          continue;
        }

        throwApiError(payload, response.status);
      }

      if (context.expectMeta) {
        if (payload.data === undefined) {
          throw new ApiError(
            payload.message || 'Phản hồi phân trang không hợp lệ',
            response.status,
            undefined,
            'UNKNOWN',
          );
        }

        if (!payload.meta) {
          throw new ApiError(
            payload.message || 'Phản hồi phân trang không hợp lệ',
            response.status,
            undefined,
            'UNKNOWN',
          );
        }

        return {
          data: payload.data,
          meta: payload.meta,
        } as T;
      }

      if (context.expectData && payload.data === undefined) {
        throw new ApiError(
          payload.message || 'Phản hồi không hợp lệ từ máy chủ',
          response.status,
          undefined,
          'UNKNOWN',
        );
      }

      if (context.returnMessage) {
        return localizeApiMessage(payload.message ?? '') as T;
      }

      return (payload.data ?? null) as T;
    } catch (error) {
      const canRetry =
        attempt < maxAttempts &&
        !context.options?.skipRetry &&
        isRetryableHttpError(error, context.method, HTTP_RETRYABLE_METHODS);

      if (!canRetry) {
        throw error;
      }

      const delayMs = getRetryDelayMs(
        attempt,
        HTTP_RETRY_BASE_DELAY_MS,
        error instanceof ApiError && error.status === 429
          ? lastRetryAfterMs
          : null,
      );
      await sleep(delayMs);
    }
  }

  throw new ApiError(
    'Không thể kết nối đến máy chủ',
    undefined,
    undefined,
    'NETWORK',
  );
}

export async function postJson<T>(
  path: string,
  body: unknown,
  options?: HttpRequestOptions,
): Promise<T> {
  return executeRequest<T>({
    method: 'POST',
    path,
    body,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function postFormData<T>(
  path: string,
  body: FormData,
  options?: HttpRequestOptions,
): Promise<T> {
  return executeRequest<T>({
    method: 'POST',
    path,
    body,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function postJsonAction(
  path: string,
  body: unknown,
  options?: HttpRequestOptions,
): Promise<void> {
  await executeRequest<null>({
    method: 'POST',
    path,
    body,
    options,
    expectData: false,
    expectMeta: false,
  });
}

export async function postJsonMessage(
  path: string,
  body: unknown,
  options?: HttpRequestOptions,
): Promise<string> {
  return executeRequest<string>({
    method: 'POST',
    path,
    body,
    options,
    expectData: false,
    expectMeta: false,
    returnMessage: true,
  });
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  options?: HttpRequestOptions,
): Promise<T> {
  return executeRequest<T>({
    method: 'PATCH',
    path,
    body,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function putJson<T>(
  path: string,
  body: unknown,
  options?: HttpRequestOptions,
): Promise<T> {
  return executeRequest<T>({
    method: 'PUT',
    path,
    body,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function putFormData<T>(
  path: string,
  body: FormData,
  options?: HttpRequestOptions,
): Promise<T> {
  return executeRequest<T>({
    method: 'PUT',
    path,
    body,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function deleteJson<T = null>(
  path: string,
  options?: HttpRequestOptions,
): Promise<T | null> {
  return executeRequest<T | null>({
    method: 'DELETE',
    path,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function getJson<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  options?: HttpRequestOptions,
): Promise<T> {
  return executeRequest<T>({
    method: 'GET',
    path,
    params,
    options,
    expectData: true,
    expectMeta: false,
  });
}

export async function getJsonPaginated<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  options?: HttpRequestOptions,
): Promise<{ data: T; meta: PaginationMeta }> {
  return executeRequest<{ data: T; meta: PaginationMeta }>({
    method: 'GET',
    path,
    params,
    options,
    expectData: false,
    expectMeta: true,
  });
}
