/**
 * Envelope response chuẩn của TOSOL API v2.
 * Mọi endpoint đều trả về `{ success, message, data?, meta? }`.
 */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
};

/** Pagination meta từ Laravel (có trong danh sách phân trang). */
export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

/**
 * Params chung cho mọi API lấy danh sách.
 * - `search` → gửi thành `filter[search]` (xử lý trong `buildListQueryParams`).
 * - Các key bổ sung (vd. `filter[is_active]`, `include`, `sort`) truyền thẳng vào `extras`.
 */
export type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  signal?: AbortSignal;
  /** Các query param mở rộng theo từng domain (filter[status], include, sort…). */
  extras?: Record<string, string | number | boolean>;
};
