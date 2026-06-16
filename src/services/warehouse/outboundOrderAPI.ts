import axios from 'axios';
import api from '@shared/services/api';
import type {
  CreateOutboundOrderPayload,
  OutboundOrderApi,
  OutboundOrderCreateApiResponse,
  OutboundOrderDetailApiResponse,
  OutboundOrdersApiResponse,
  OutboundOrdersMeta,
} from './outboundOrderApiTypes';

const DEFAULT_INCLUDE =
  'warehouse,seller,items.product,saleOrder,transferOrder,sourceOutboundOrder,sourceOutboundOrder.warehouse';

export type GetOutboundOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string | null;
  filterStatus?: string;
  search?: string;
  signal?: AbortSignal;
};

function buildQueryParams(
  p: GetOutboundOrdersParams,
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

function unwrapList(res: OutboundOrdersApiResponse): {
  items: OutboundOrderApi[];
  meta: OutboundOrdersMeta | null;
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

export type OutboundOrdersPageResult = {
  items: OutboundOrderApi[];
  meta: OutboundOrdersMeta | null;
};

/**
 * GET `/outbound-orders` — danh sách lệnh xuất kho.
 */
export async function getOutboundOrdersPage(
  params: GetOutboundOrdersParams = {},
): Promise<OutboundOrdersPageResult> {
  try {
    const { data } = await api.get<OutboundOrdersApiResponse>(
      '/outbound-orders',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh xuất kho',
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
    throw new Error('Không tải được lệnh xuất kho');
  }
}

/** Query `include` cho chi tiết phiếu xuất kho (admin / Forge). */
export const OUTBOUND_ORDER_DETAIL_INCLUDE =
  'seller,warehouse,destinationWarehouse,reviewer,items,items.product,saleOrder,transferOrder,packingOrder.boxes,packingOrder.boxes.boxTemplate,packingOrder.boxes.items,sourceOutboundOrder,sourceOutboundOrder.warehouse';

/**
 * GET `/outbound-orders/{orderNumber}` — vd. `OBMCT-2600042`.
 */
export async function getOutboundOrderDetail(
  orderRef: string,
  opts?: { signal?: AbortSignal },
): Promise<OutboundOrderApi> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã phiếu xuất kho');
  }
  try {
    const { data } = await api.get<OutboundOrderDetailApiResponse>(
      `/outbound-orders/${encodeURIComponent(ref)}`,
      {
        params: { include: OUTBOUND_ORDER_DETAIL_INCLUDE },
        signal: opts?.signal,
      },
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được phiếu xuất kho',
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
    throw new Error('Không tải được phiếu xuất kho');
  }
}

/**
 * POST `/outbound-orders` — tạo phiếu xuất kho mới.
 */
export async function createOutboundOrder(
  payload: CreateOutboundOrderPayload,
): Promise<OutboundOrderApi> {
  try {
    const { data } = await api.post<OutboundOrderCreateApiResponse>(
      '/outbound-orders',
      payload,
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được phiếu xuất kho',
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
    throw new Error('Không tạo được phiếu xuất kho');
  }
}
