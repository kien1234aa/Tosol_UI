import axios from 'axios';
import api from '@shared/services/api';
import type {
  PackingOrderApi,
  PackingOrderDetailApiResponse,
  PackingOrdersApiResponse,
  PackingOrdersMeta,
} from './packingOrderApiTypes';

const DEFAULT_INCLUDE =
  'warehouse,seller,saleOrder,saleOrder.items.product,assignedUser';

export type GetPackingOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  /**
   * Quan hệ kèm theo. Truyền `null` để không gửi `include` (phù hợp `per_page=1` chỉ lấy `meta.total`).
   */
  include?: string | null;
  /** `filter[status]` — vd. `pending`, `packing`, `cancelled`. */
  filterStatus?: string;
  /** `filter[has_pending_unpack]` — `true` khi cần lọc chờ mở hộp. */
  filterHasPendingUnpack?: boolean;
  search?: string;
  signal?: AbortSignal;
};

function buildQueryParams(
  p: GetPackingOrdersParams,
): Record<string, string | number | boolean> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include: includeParam,
    filterStatus,
    filterHasPendingUnpack,
    search,
  } = p;

  const include =
    includeParam === null
      ? null
      : includeParam === undefined
      ? DEFAULT_INCLUDE
      : includeParam;

  const params: Record<string, string | number | boolean> = {
    page,
    per_page,
    sort,
  };

  if (include != null && String(include).trim() !== '') {
    params.include = include;
  }

  if (filterStatus?.trim()) {
    params['filter[status]'] = filterStatus.trim();
  }
  if (filterHasPendingUnpack === true) {
    params['filter[has_pending_unpack]'] = true;
  }
  const q = search?.trim();
  if (q) {
    params.search = q;
  }

  return params;
}

function unwrapList(res: PackingOrdersApiResponse): {
  items: PackingOrderApi[];
  meta: PackingOrdersMeta | null;
} {
  const raw = res.data;
  if (Array.isArray(raw)) {
    return { items: raw, meta: res.meta ?? null };
  }
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
    return { items: raw.data, meta: res.meta ?? null };
  }
  return { items: [], meta: res.meta ?? null };
}

export type PackingOrdersPageResult = {
  items: PackingOrderApi[];
  meta: PackingOrdersMeta | null;
};

/**
 * GET `/packing-orders` — danh sách lệnh đóng gói.
 */
export async function getPackingOrdersPage(
  params: GetPackingOrdersParams = {},
): Promise<PackingOrdersPageResult> {
  try {
    const { data } = await api.get<PackingOrdersApiResponse>(
      '/packing-orders',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh đóng gói',
      );
    }
    return unwrapList(data);
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tải được lệnh đóng gói');
  }
}

/** Query `include` cho chi tiết lệnh đóng gói (admin / Forge). */
export const PACKING_ORDER_DETAIL_INCLUDE =
  'seller,warehouse,saleOrder,outboundOrder,assignedUser,stagingLocation,boxes,boxes.items,boxes.items.product';

/**
 * GET `/packing-orders/{orderNumber}` — `orderNumber` vd. `PK-MCT-2600165`.
 */
export async function getPackingOrderDetail(
  orderRef: string,
  opts?: { signal?: AbortSignal },
): Promise<PackingOrderApi> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã lệnh đóng gói');
  }
  try {
    const { data } = await api.get<PackingOrderDetailApiResponse>(
      `/packing-orders/${encodeURIComponent(ref)}`,
      {
        params: { include: PACKING_ORDER_DETAIL_INCLUDE },
        signal: opts?.signal,
      },
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh đóng gói',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tải được lệnh đóng gói');
  }
}
