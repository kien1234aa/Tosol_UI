import { API_BASE_URL } from '@/src/configs/api';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
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

function buildAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function buildQueryString(
  query?: Record<string, string | number | boolean>,
): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.append(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

async function parseJsonResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ', response.status);
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: { baseUrl?: string },
): Promise<T> {
  const baseUrl = options?.baseUrl ?? API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, init);
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
 * GET helper for the Tosol API envelope format: { success, message, data }.
 */
export async function getJson<T>(
  path: string,
  options?: {
    baseUrl?: string;
    token?: string;
    query?: Record<string, string | number | boolean>;
  },
): Promise<T> {
  const queryString = buildQueryString(options?.query);

  return requestJson<T>(
    `${path}${queryString}`,
    {
      method: 'GET',
      headers: buildAuthHeaders(options?.token),
    },
    { baseUrl: options?.baseUrl },
  );
}

/**
 * POST helper for the Tosol API envelope format: { success, message, data }.
 */
export async function postJson<T>(
  path: string,
  body: unknown,
  options?: { baseUrl?: string; token?: string },
): Promise<T> {
  return requestJson<T>(
    path,
    {
      method: 'POST',
      headers: {
        ...buildAuthHeaders(options?.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    { baseUrl: options?.baseUrl },
  );
}
