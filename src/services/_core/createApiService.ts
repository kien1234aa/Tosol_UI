import api from './api';
import { buildListQueryParams, throwApiError } from './apiHelpers';
import type { ApiEnvelope, ListParams } from './apiTypes';

/**
 * Tuỳ chỉnh thông báo lỗi theo từng domain.
 * Nếu không truyền, dùng thông báo mặc định tiếng Việt.
 */
export type ApiServiceErrorMessages = {
  list?: string;
  detail?: string;
  create?: string;
  update?: string;
  delete?: string;
  action?: string;
};

export type ApiServiceOptions = {
  errorMessages?: ApiServiceErrorMessages;
};

/**
 * Factory tạo CRUD service cho một endpoint REST.
 *
 * @template TListItem  - Kiểu item trong danh sách (GET /<endpoint>)
 * @template TDetail    - Kiểu chi tiết (GET /<endpoint>/:id) — mặc định bằng TListItem
 * @template TCreate    - Payload tạo mới (POST) — mặc định Partial<TDetail>
 * @template TUpdate    - Payload cập nhật (PUT) — mặc định Partial<TDetail>
 *
 * @example
 * // Đơn giản nhất — customer
 * export const customerService = createApiService<CustomerListItemApi, CustomerDetailApi>(
 *   '/customers',
 *   { errorMessages: { list: 'Không tải được khách hàng' } },
 * );
 *
 * @example
 * // Mở rộng custom action — order
 * const base = createApiService<SaleOrderItem, SaleOrderDetail>('/sale-orders');
 * export const orderService = {
 *   ...base,
 *   confirm: (id: number) => base.action(id, 'confirm'),
 *   cancel:  (id: number) => base.action(id, 'cancel'),
 * };
 */
export function createApiService<
  TListItem,
  TDetail = TListItem,
  TCreate = Partial<TDetail>,
  TUpdate = Partial<TDetail>,
>(endpoint: string, options: ApiServiceOptions = {}) {
  const msg = options.errorMessages ?? {};

  return {
    /**
     * GET /<endpoint> — danh sách phân trang.
     * `params.search` tự động chuyển thành `filter[search]`.
     * `params.extras` để truyền thêm filter tuỳ domain.
     */
    getList: async (params: ListParams = {}): Promise<ApiEnvelope<TListItem[]>> => {
      const { signal, ...rest } = params;
      try {
        const { data } = await api.get<ApiEnvelope<TListItem[]>>(endpoint, {
          params: buildListQueryParams(rest),
          signal,
        });
        if (!data.success || data.data === undefined) {
          throw new Error(
            typeof data.message === 'string' ? data.message : (msg.list ?? 'Lỗi tải danh sách'),
          );
        }
        return data;
      } catch (e) {
        throwApiError(e, msg.list ?? 'Lỗi tải danh sách');
      }
    },

    /**
     * GET /<endpoint>/:id — chi tiết một bản ghi.
     * `queryParams` để truyền thêm (vd. `{ include: 'seller' }`).
     */
    getById: async (
      id: number | string,
      queryParams?: Record<string, unknown>,
      opts?: { signal?: AbortSignal },
    ): Promise<TDetail> => {
      try {
        const { data } = await api.get<ApiEnvelope<TDetail>>(`${endpoint}/${id}`, {
          params: queryParams,
          signal: opts?.signal,
        });
        if (!data.success || data.data === undefined) {
          throw new Error(
            typeof data.message === 'string' ? data.message : (msg.detail ?? 'Lỗi tải chi tiết'),
          );
        }
        return data.data;
      } catch (e) {
        throwApiError(e, msg.detail ?? 'Lỗi tải chi tiết');
      }
    },

    /**
     * POST /<endpoint> — tạo mới bản ghi.
     * Truyền FormData nếu upload file (nhớ xoá Content-Type header).
     */
    create: async (payload: TCreate, opts?: { signal?: AbortSignal }): Promise<TDetail> => {
      try {
        const { data } = await api.post<ApiEnvelope<TDetail>>(endpoint, payload, {
          signal: opts?.signal,
        });
        if (!data.success || data.data === undefined) {
          throw new Error(
            typeof data.message === 'string' ? data.message : (msg.create ?? 'Lỗi tạo mới'),
          );
        }
        return data.data;
      } catch (e) {
        throwApiError(e, msg.create ?? 'Lỗi tạo mới');
      }
    },

    /**
     * PUT /<endpoint>/:id — cập nhật bản ghi.
     */
    update: async (
      id: number | string,
      payload: TUpdate,
      opts?: { signal?: AbortSignal },
    ): Promise<TDetail> => {
      try {
        const { data } = await api.put<ApiEnvelope<TDetail>>(`${endpoint}/${id}`, payload, {
          signal: opts?.signal,
        });
        if (!data.success || data.data === undefined) {
          throw new Error(
            typeof data.message === 'string' ? data.message : (msg.update ?? 'Lỗi cập nhật'),
          );
        }
        return data.data;
      } catch (e) {
        throwApiError(e, msg.update ?? 'Lỗi cập nhật');
      }
    },

    /**
     * DELETE /<endpoint>/:id — xoá bản ghi.
     */
    delete: async (id: number | string, opts?: { signal?: AbortSignal }): Promise<void> => {
      try {
        const { data } = await api.delete<ApiEnvelope<unknown>>(`${endpoint}/${id}`, {
          signal: opts?.signal,
        });
        if (data && data.success === false) {
          throw new Error(
            typeof data.message === 'string' ? data.message : (msg.delete ?? 'Lỗi xoá'),
          );
        }
      } catch (e) {
        throwApiError(e, msg.delete ?? 'Lỗi xoá');
      }
    },

    /**
     * POST /<endpoint>/:id/<action> — thực hiện action trên bản ghi.
     * Dùng cho: confirm, cancel, activate, deactivate, mark-issue…
     *
     * @example
     * base.action(orderId, 'confirm')
     * base.action(supplierId, 'deactivate')
     */
    action: async (
      id: number | string,
      actionName: string,
      payload?: unknown,
      opts?: { signal?: AbortSignal },
    ): Promise<TDetail> => {
      try {
        const { data } = await api.post<ApiEnvelope<TDetail>>(
          `${endpoint}/${id}/${actionName}`,
          payload ?? {},
          { signal: opts?.signal },
        );
        if (!data.success || data.data === undefined) {
          throw new Error(
            typeof data.message === 'string' ? data.message : (msg.action ?? 'Lỗi thực hiện'),
          );
        }
        return data.data;
      } catch (e) {
        throwApiError(e, msg.action ?? 'Lỗi thực hiện');
      }
    },
  };
}

/** Kiểu trả về của `createApiService` — dùng để type các biến nhận service. */
export type ApiService<TListItem, TDetail = TListItem, TCreate = Partial<TDetail>, TUpdate = Partial<TDetail>> =
  ReturnType<typeof createApiService<TListItem, TDetail, TCreate, TUpdate>>;
