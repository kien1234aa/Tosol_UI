import axios from 'axios';
import api from '@shared/services/api';
import type {
  InboundOrderApi,
  InboundOrderDetailApiResponse,
  InboundOrdersApiResponse,
  InboundOrdersMeta,
} from './inboundOrderApiTypes';

const DEFAULT_INCLUDE =
  'warehouse,seller,items.product,purchaseOrder,purchaseOrder.supplier,saleOrder,transferOrder';

export type GetInboundOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string | null;
  filterStatus?: string;
  search?: string;
  signal?: AbortSignal;
};

function buildQueryParams(
  p: GetInboundOrdersParams,
): Record<string, string | number | boolean> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include: includeParam,
    filterStatus,
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
  const q = search?.trim();
  if (q) {
    params.search = q;
  }

  return params;
}

function unwrapList(res: InboundOrdersApiResponse): {
  items: InboundOrderApi[];
  meta: InboundOrdersMeta | null;
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

export type InboundOrdersPageResult = {
  items: InboundOrderApi[];
  meta: InboundOrdersMeta | null;
};

/**
 * GET `/inbound-orders` — danh sách lệnh nhập kho.
 */
export async function getInboundOrdersPage(
  params: GetInboundOrdersParams = {},
): Promise<InboundOrdersPageResult> {
  try {
    const { data } = await api.get<InboundOrdersApiResponse>(
      '/inbound-orders',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh nhập kho',
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
    throw new Error('Không tải được lệnh nhập kho');
  }
}

/** Query `include` cho chi tiết phiếu nhập kho (admin / Forge). */
export const INBOUND_ORDER_DETAIL_INCLUDE =
  'seller,warehouse,items,items.product,items.receives,items.receives.location,purchaseOrder,purchaseOrder.items,purchaseOrder.supplier,saleOrder,transferOrder';

/**
 * GET `/inbound-orders/{orderNumber}` — vd. `IBP-MCT-2600030`.
 */
export async function getInboundOrderDetail(
  orderRef: string,
  opts?: { signal?: AbortSignal },
): Promise<InboundOrderApi> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã phiếu nhập kho');
  }
  try {
    const { data } = await api.get<InboundOrderDetailApiResponse>(
      `/inbound-orders/${encodeURIComponent(ref)}`,
      {
        params: { include: INBOUND_ORDER_DETAIL_INCLUDE },
        signal: opts?.signal,
      },
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được phiếu nhập kho',
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
    throw new Error('Không tải được phiếu nhập kho');
  }
}
