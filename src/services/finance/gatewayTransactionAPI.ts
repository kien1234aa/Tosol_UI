import axios from 'axios';
import api from '@shared/services/api';
import type { GatewayTransactionsListApiResponse } from './gatewayTransactionApiTypes';

export const GATEWAY_TXN_LIST_INCLUDE = 'payment,saleOrder';

export type GetGatewayTransactionsListParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  skipInclude?: boolean;
  skipSort?: boolean;
  filterStatus?: string;
  search?: string;
  /** `filter[seller_id]` — người bán / cổng (khớp `payment.seller`). */
  filterSellerId?: number;
  /** `filter[type]` — payment | refund. */
  filterType?: string;
  /** `filter[date_from]` — YYYY-MM-DD. */
  filterDateFrom?: string;
  /** `filter[date_to]` — YYYY-MM-DD. */
  filterDateTo?: string;
  signal?: AbortSignal;
};

function buildGatewayTxnQueryParams(
  p: GetGatewayTransactionsListParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 10,
    sort,
    include = GATEWAY_TXN_LIST_INCLUDE,
    skipInclude,
    skipSort,
    filterStatus,
    search,
    filterSellerId,
    filterType,
    filterDateFrom,
    filterDateTo,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
  };

  if (!skipSort && sort != null && String(sort).trim() !== '') {
    params.sort = String(sort).trim();
  }

  if (!skipInclude) {
    params.include = include;
  }

  if (filterStatus?.trim()) {
    params['filter[status]'] = filterStatus.trim();
  }

  const q = search?.trim();
  if (q) {
    params['filter[search]'] = q;
  }

  if (
    filterSellerId != null &&
    Number.isFinite(filterSellerId) &&
    filterSellerId > 0
  ) {
    params['filter[seller_id]'] = filterSellerId;
  }

  const ft = filterType?.trim();
  if (ft) {
    params['filter[type]'] = ft;
  }

  const df = filterDateFrom?.trim();
  if (df) {
    params['filter[date_from]'] = df;
  }
  const dt = filterDateTo?.trim();
  if (dt) {
    params['filter[date_to]'] = dt;
  }

  return params;
}

export async function getGatewayTransactionsList(
  params: GetGatewayTransactionsListParams = {},
): Promise<GatewayTransactionsListApiResponse> {
  try {
    const { data } = await api.get<GatewayTransactionsListApiResponse>(
      '/payment-gateways/transactions/list',
      {
        params: buildGatewayTxnQueryParams(params),
        signal: params.signal,
      },
    );
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
    throw new Error('Không tải được giao dịch cổng thanh toán');
  }
}
