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
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
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
