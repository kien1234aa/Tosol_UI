import axios from 'axios';
import api from '@shared/services/api';
import type {
  TransferOrderApi,
  TransferOrderDetailApiResponse,
  TransferOrdersApiResponse,
  TransferOrdersMeta,
} from './transferOrderApiTypes';

const DEFAULT_INCLUDE =
  'fromWarehouse,toWarehouse,creator,outboundOrders,inboundOrders';

/** Query `include` cho chi tiết lệnh chuyển kho. */
export const TRANSFER_ORDER_DETAIL_INCLUDE = DEFAULT_INCLUDE;

export type GetTransferOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string | null;
  filterStatus?: string;
  search?: string;
  signal?: AbortSignal;
};

function buildQueryParams(
  p: GetTransferOrdersParams,
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

function unwrapList(res: TransferOrdersApiResponse): {
  items: TransferOrderApi[];
  meta: TransferOrdersMeta | null;
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

export type TransferOrdersPageResult = {
  items: TransferOrderApi[];
  meta: TransferOrdersMeta | null;
};

/**
 * GET `/transfer-orders` — danh sách lệnh chuyển kho.
 */
export async function getTransferOrdersPage(
  params: GetTransferOrdersParams = {},
): Promise<TransferOrdersPageResult> {
  try {
    const { data } = await api.get<TransferOrdersApiResponse>(
      '/transfer-orders',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh chuyển kho',
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
    throw new Error('Không tải được lệnh chuyển kho');
  }
}

/**
 * GET `/transfer-orders/{orderNumber}` — vd. `TR-MCT-2600006`.
 */
export async function getTransferOrderDetail(
  orderRef: string,
  opts?: { signal?: AbortSignal },
): Promise<TransferOrderApi> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã lệnh chuyển kho');
  }
  try {
    const { data } = await api.get<TransferOrderDetailApiResponse>(
      `/transfer-orders/${encodeURIComponent(ref)}`,
      {
        params: { include: TRANSFER_ORDER_DETAIL_INCLUDE },
        signal: opts?.signal,
      },
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh chuyển kho',
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
    throw new Error('Không tải được lệnh chuyển kho');
  }
}
