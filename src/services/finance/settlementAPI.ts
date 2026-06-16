import axios from 'axios';
import api from '@shared/services/api';
import type {
  SettlementApi,
  SettlementDetailApiResponse,
  SettlementsListApiResponse,
} from './settlementApiTypes';

export const SETTLEMENTS_LIST_INCLUDE = 'seller,items,items.currency';

/** Include khi GET chi tiết — khớp backend v2. */
export const SETTLEMENT_DETAIL_INCLUDE =
  'seller,warehouse,items,items.currency,payments,payments.currency,payments.processedByUser,createdByUser,confirmedByUser';

export type GetSettlementsParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  /** Query `filter[status]` — draft | confirmed | settled */
  filterStatus?: string;
  search?: string;
  signal?: AbortSignal;
};

function buildSettlementsQueryParams(
  p: GetSettlementsParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include = SETTLEMENTS_LIST_INCLUDE,
    filterStatus,
    search,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
    include,
  };

  if (filterStatus?.trim()) {
    params['filter[status]'] = filterStatus.trim();
  }

  const q = search?.trim();
  if (q) {
    params['filter[search]'] = q;
  }

  return params;
}

export async function getSettlements(
  params: GetSettlementsParams = {},
): Promise<SettlementsListApiResponse> {
  try {
    const { data } = await api.get<SettlementsListApiResponse>('/settlements', {
      params: buildSettlementsQueryParams(params),
      signal: params.signal,
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
    throw new Error('Không tải được danh sách đối soát');
  }
}

export type GetSettlementDetailParams = {
  include?: string;
  signal?: AbortSignal;
};

/**
 * GET /settlements/{ref}
 * `settlementRef` là `settlement_number` (vd. STL-S1-202603-0001).
 */
export async function getSettlementDetail(
  settlementRef: string,
  params: GetSettlementDetailParams = {},
): Promise<SettlementApi> {
  const ref = settlementRef.trim();
  if (!ref) {
    throw new Error('Thiếu đối soát');
  }
  const include = params.include ?? SETTLEMENT_DETAIL_INCLUDE;
  try {
    const { data } = await api.get<SettlementDetailApiResponse>(
      `/settlements/${encodeURIComponent(ref)}`,
      {
        params: { include },
        signal: params.signal,
      },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được đối soát',
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
    throw new Error('Không tải được đối soát');
  }
}

function extractAxiosErrorMessage(e: unknown, fallback: string): never {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data as { message?: string } | undefined;
    if (typeof d?.message === 'string' && d.message.trim() !== '') {
      throw new Error(d.message);
    }
  }
  if (e instanceof Error) {
    throw e;
  }
  throw new Error(fallback);
}

/** POST /settlements/{ref}/confirm — chuyển từ `draft` sang `confirmed`. */
export async function confirmSettlement(
  settlementRef: string,
  opts?: { signal?: AbortSignal },
): Promise<SettlementApi> {
  const ref = settlementRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đối soát');
  }
  const path = `/settlements/${encodeURIComponent(ref)}/confirm`;
  try {
    const { data } = await api.post<SettlementDetailApiResponse>(
      path,
      {},
      { signal: opts?.signal },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không xác nhận được đối soát',
      );
    }
    return data.data;
  } catch (e: unknown) {
    extractAxiosErrorMessage(e, 'Không xác nhận được đối soát');
  }
}

/** POST /settlements/{ref}/settle — hoàn tất quyết toán, trạng thái `settled`. */
export async function settleSettlement(
  settlementRef: string,
  opts?: { signal?: AbortSignal },
): Promise<SettlementApi> {
  const ref = settlementRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đối soát');
  }
  const path = `/settlements/${encodeURIComponent(ref)}/settle`;
  try {
    const { data } = await api.post<SettlementDetailApiResponse>(
      path,
      {},
      { signal: opts?.signal },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không hoàn tất được đối soát',
      );
    }
    return data.data;
  } catch (e: unknown) {
    extractAxiosErrorMessage(e, 'Không hoàn tất được đối soát');
  }
}

/** POST /settlements/{ref}/cancel — body `{ reason }`, trạng thái `cancelled`. */
export async function cancelSettlement(
  settlementRef: string,
  reason: string,
  opts?: { signal?: AbortSignal },
): Promise<SettlementApi> {
  const ref = settlementRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đối soát');
  }
  const r = reason.trim();
  if (!r) {
    throw new Error('Vui lòng nhập lý do hủy đối soát');
  }
  const path = `/settlements/${encodeURIComponent(ref)}/cancel`;
  try {
    const { data } = await api.post<SettlementDetailApiResponse>(
      path,
      { reason: r },
      { signal: opts?.signal },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không hủy được đối soát',
      );
    }
    return data.data;
  } catch (e: unknown) {
    extractAxiosErrorMessage(e, 'Không hủy được đối soát');
  }
}

export type AcceptSettlementPaymentParams = {
  /** Số tiền ghi nhận (tùy chọn — backend có thể tự lấy từ `payable_amount`). */
  amount?: number;
  /** Ghi chú (tùy chọn). */
  notes?: string;
  signal?: AbortSignal;
};

/**
 * POST /settlements/{ref}/accept-payment — ghi nhận thanh toán theo cờ `can_accept_payment`.
 * Body cho phép truyền `amount` / `notes` tùy backend; nếu thiếu, backend ghi theo `payable_amount`.
 */
export async function acceptSettlementPayment(
  settlementRef: string,
  params: AcceptSettlementPaymentParams = {},
): Promise<SettlementApi> {
  const ref = settlementRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đối soát');
  }
  const body: Record<string, string | number> = {};
  if (params.amount != null && Number.isFinite(params.amount)) {
    body.amount = params.amount;
  }
  const n = params.notes?.trim();
  if (n) {
    body.notes = n;
  }
  const path = `/settlements/${encodeURIComponent(ref)}/accept-payment`;
  try {
    const { data } = await api.post<SettlementDetailApiResponse>(path, body, {
      signal: params.signal,
    });
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không ghi nhận được thanh toán',
      );
    }
    return data.data;
  } catch (e: unknown) {
    extractAxiosErrorMessage(e, 'Không ghi nhận được thanh toán');
  }
}
