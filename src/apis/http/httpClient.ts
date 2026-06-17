import { API_BASE_URL } from '@/src/configs/api';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

let authTokenGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(getter: () => string | null): void {
  authTokenGetter = getter;
}

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const token = authTokenGetter?.();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJsonResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ', response.status);
  }
}

/**
 * POST helper for the Tosol API envelope format: { success, message, data }.
 */
export async function postJson<T>(
  path: string,
  body: unknown,
  options?: { baseUrl?: string },
): Promise<T> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ');
  }

  const payload = await parseJsonResponse<T>(response);

  if (!payload.success) {
    throw new ApiError(payload.message || 'Yêu cầu thất bại', response.status);
  }

  if (payload.data === undefined) {
    throw new ApiError(
      payload.message || 'Phản hồi không hợp lệ từ máy chủ',
      response.status,
    );
  }

  return payload.data;
}

/**
 * POST helper when the API returns success without a `data` payload.
 */
export async function postJsonAction(
  path: string,
  body: unknown,
  options?: { baseUrl?: string },
): Promise<void> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ');
  }

  const payload = await parseJsonResponse<unknown>(response);

  if (!payload.success) {
    throw new ApiError(payload.message || 'Yêu cầu thất bại', response.status);
  }
}

/**
 * PATCH helper for the Tosol API envelope format: { success, message, data }.
 */
export async function patchJson<T>(
  path: string,
  body: unknown,
  options?: { baseUrl?: string },
): Promise<T> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ');
  }

  const payload = await parseJsonResponse<T>(response);

  if (!payload.success) {
    throw new ApiError(payload.message || 'Yêu cầu thất bại', response.status);
  }

  if (payload.data === undefined) {
    throw new ApiError(
      payload.message || 'Phản hồi không hợp lệ từ máy chủ',
      response.status,
    );
  }

  return payload.data;
}

/**
 * DELETE helper for the Tosol API envelope format: { success, message, data }.
 * Allows `data: null` responses (e.g. clearing warehouse context).
 */
export async function deleteJson<T = null>(
  path: string,
  options?: { baseUrl?: string },
): Promise<T | null> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ');
  }

  const payload = await parseJsonResponse<T | null>(response);

  if (!payload.success) {
    throw new ApiError(payload.message || 'Yêu cầu thất bại', response.status);
  }

  return payload.data ?? null;
}

/**
 * GET helper for the Tosol API envelope format: { success, message, data }.
 */
export async function getJson<T>(
  path: string,
  params?: Record<string, string | number>,
  options?: { baseUrl?: string },
): Promise<T> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;
  const query = params
    ? `?${new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      ).toString()}`
    : '';

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}${query}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ');
  }

  const payload = await parseJsonResponse<T>(response);

  if (!payload.success) {
    throw new ApiError(payload.message || 'Yêu cầu thất bại', response.status);
  }

  if (payload.data === undefined) {
    throw new ApiError(
      payload.message || 'Phản hồi không hợp lệ từ máy chủ',
      response.status,
    );
  }

  return payload.data;
}

/**
 * GET helper for paginated Tosol API responses: { success, message, data, meta }.
 */
export async function getJsonPaginated<T>(
  path: string,
  params?: Record<string, string | number>,
  options?: { baseUrl?: string },
): Promise<{ data: T; meta: PaginationMeta }> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;
  const query = params
    ? `?${new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      ).toString()}`
    : '';

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}${query}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ');
  }

  const payload = await parseJsonResponse<T>(response);

  if (!payload.success) {
    throw new ApiError(payload.message || 'Yêu cầu thất bại', response.status);
  }

  if (payload.data === undefined) {
    throw new ApiError(
      payload.message || 'Phản hồi không hợp lệ từ máy chủ',
      response.status,
    );
  }

  if (!payload.meta) {
    throw new ApiError(
      payload.message || 'Phản hồi phân trang không hợp lệ',
      response.status,
    );
  }

  return {
    data: payload.data,
    meta: payload.meta,
  };
}
