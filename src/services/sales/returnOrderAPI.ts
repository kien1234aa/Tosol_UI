import axios from 'axios';
import api from '@shared/services/api';
import type { ReturnOrdersApiResponse } from './returnOrderApiTypes';

export const RETURN_ORDERS_LIST_INCLUDE =
  'saleOrder,warehouse,seller,items,items.product';

/**
 * Query GET /return-orders — khớp query thực tế, vd.:
 * `filter[status]`, `filter[return_type]`, `filter[reason]`, `filter[refund_status]`,
 * `filter[date_from]`, `filter[date_to]` (+ tuỳ chọn `filter[search]`).
 */
export type ReturnOrderListFilters = {
  /** `filter[status]` */
  filterStatus?: string;
  /** `filter[return_type]` — `full` | `partial` */
  filterReturnType?: string;
  /** `filter[reason]` */
  filterReason?: string;
  /** `filter[refund_status]` */
  filterRefundStatus?: string;
  /** `filter[date_from]` — YYYY-MM-DD */
  filterDateFrom?: string;
  /** `filter[date_to]` — YYYY-MM-DD */
  filterDateTo?: string;
  /** `filter[search]` */
  filterSearch?: string;
};

/** Bộ lọc rỗng — đồng bộ modal / slice. */
export const EMPTY_RETURN_ORDER_LIST_FILTERS: ReturnOrderListFilters = {};

export type GetReturnOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  filters?: ReturnOrderListFilters;
};

function buildQueryParams(
  p: GetReturnOrdersParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 15,
    sort = '-created_at',
    include = RETURN_ORDERS_LIST_INCLUDE,
    filters,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
    include,
  };

  if (filters?.filterStatus?.trim()) {
    params['filter[status]'] = filters.filterStatus.trim();
  }
  if (filters?.filterReturnType?.trim()) {
    params['filter[return_type]'] = filters.filterReturnType.trim();
  }
  if (filters?.filterReason?.trim()) {
    params['filter[reason]'] = filters.filterReason.trim();
  }
  if (filters?.filterRefundStatus?.trim()) {
    params['filter[refund_status]'] = filters.filterRefundStatus.trim();
  }
  if (filters?.filterDateFrom?.trim()) {
    params['filter[date_from]'] = filters.filterDateFrom.trim();
  }
  if (filters?.filterDateTo?.trim()) {
    params['filter[date_to]'] = filters.filterDateTo.trim();
  }
  if (filters?.filterSearch?.trim()) {
    params['filter[search]'] = filters.filterSearch.trim();
  }

  return params;
}

export async function getReturnOrders(
  params: GetReturnOrdersParams = {},
): Promise<ReturnOrdersApiResponse> {
  try {
    const { data } = await api.get<ReturnOrdersApiResponse>('/return-orders', {
      params: buildQueryParams(params),
    });
    return data;
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
    throw new Error('Không tải được đơn trả hàng');
  }
}
