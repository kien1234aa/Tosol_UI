import { isAxiosError } from 'axios';
import type { ListParams } from './apiTypes';

/**
 * Trích xuất message lỗi từ Axios response hoặc Error object.
 * Thứ tự ưu tiên: axios response.data.message → Error.message → fallback.
 */
export function extractApiErrorMessage(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as { message?: string } | undefined;
    if (typeof d?.message === 'string' && d.message.length > 0) {
      return d.message;
    }
  }
  if (e instanceof Error && e.message.length > 0) {
    return e.message;
  }
  return fallback;
}

/**
 * Throw lỗi với message trích xuất từ Axios/Error.
 * Dùng ở catch block — kiểu trả về `never` để TypeScript biết hàm luôn throw.
 */
export function throwApiError(e: unknown, fallback: string): never {
  throw new Error(extractApiErrorMessage(e, fallback));
}

/**
 * Xây dựng query params chuẩn cho API danh sách:
 * - `page`, `per_page` → luôn có.
 * - `search` trim → `filter[search]` (bỏ nếu rỗng).
 * - `extras` → spread trực tiếp (filter[status], include, sort…).
 */
export function buildListQueryParams(
  params: Omit<ListParams, 'signal'>,
): Record<string, string | number | boolean> {
  const { page = 1, per_page = 15, search, extras } = params;
  const q: Record<string, string | number | boolean> = { page, per_page };

  const s = search?.trim();
  if (s && s.length > 0) {
    q['filter[search]'] = s;
  }

  if (extras) {
    Object.assign(q, extras);
  }

  return q;
}
