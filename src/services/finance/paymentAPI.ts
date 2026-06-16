import axios, { AxiosHeaders } from 'axios';
import api from '@shared/services/api';
import type {
  PaymentAttachmentApi,
  PaymentDetailApiResponse,
  PaymentDetailDataApi,
  PaymentsListApiResponse,
} from './paymentApiTypes';

export type PaymentAttachmentUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type PaymentAttachmentUploadApiResponse = {
  success: boolean;
  message?: string;
  data?: PaymentAttachmentApi | PaymentAttachmentApi[];
};

/** Khớp API v2 — eager load đơn, khách, tiền tệ đơn, seller. */
export const PAYMENTS_LIST_INCLUDE =
  'saleOrder,saleOrder.customer,saleOrder.currency,seller';

/** GET chi tiết — đủ đơn, seller, xử lý, TK ngân hàng (attachments có thể thiếu uploader). */
export const PAYMENT_DETAIL_INCLUDE =
  'saleOrder,saleOrder.customer,saleOrder.currency,seller,processor,bankAccount,attachments,attachments.uploader';

/** Gọi thêm (song song hoặc sau) để luôn có `attachments.uploader` khi backend tách include. */
export const PAYMENT_DETAIL_ATTACHMENTS_INCLUDE =
  'attachments,attachments.uploader';

export type GetPaymentsParams = {
  page?: number;
  per_page?: number;
  /** Gửi `sort` (vd. `-created_at`). Bỏ trống thì không gửi — khớp URL danh sách API. */
  sort?: string;
  include?: string;
  /** Không gửi `include` (gọi đếm `per_page=1` nhẹ). */
  skipInclude?: boolean;
  /** Không gửi `sort` (khớp URL đếm của API). */
  skipSort?: boolean;
  /** `filter[status]` — pending | completed | failed | cancelled */
  filterStatus?: string;
  /** `filter[payment_method]` — cash | bank_transfer | cod | momo | vnpay | other (tuỳ API). */
  filterPaymentMethod?: string;
  /** `filter[type]` — payment | refund */
  filterPaymentType?: string;
  /** `filter[search]` — mã thanh toán, mã đơn… */
  search?: string;
  /** `filter[date_from]` — YYYY-MM-DD (khớp pattern đơn hàng / API). */
  filterDateFrom?: string;
  /** `filter[date_to]` — YYYY-MM-DD. */
  filterDateTo?: string;
  /** `filter[amount_from]` — số tiền tối thiểu (chuỗi số). */
  filterAmountFrom?: string;
  /** `filter[amount_to]` — số tiền tối đa. */
  filterAmountTo?: string;
  /** Chỉ giao dịch qua cổng — `filter[is_gateway_payment]=1` */
  gatewayOnly?: boolean;
  signal?: AbortSignal;
};

function buildPaymentsQueryParams(
  p: GetPaymentsParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 10,
    sort,
    include = PAYMENTS_LIST_INCLUDE,
    skipInclude,
    skipSort,
    filterStatus,
    filterPaymentMethod,
    filterPaymentType,
    search,
    filterDateFrom,
    filterDateTo,
    filterAmountFrom,
    filterAmountTo,
    gatewayOnly,
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

  const pm = filterPaymentMethod?.trim();
  if (pm) {
    params['filter[payment_method]'] = pm;
  }
  const pt = filterPaymentType?.trim();
  if (pt) {
    params['filter[type]'] = pt;
  }

  const q = search?.trim();
  if (q) {
    params['filter[search]'] = q;
  }

  const df = filterDateFrom?.trim();
  if (df) {
    params['filter[date_from]'] = df;
  }
  const dt = filterDateTo?.trim();
  if (dt) {
    params['filter[date_to]'] = dt;
  }
  const af = filterAmountFrom?.trim();
  if (af) {
    params['filter[amount_from]'] = af;
  }
  const at = filterAmountTo?.trim();
  if (at) {
    params['filter[amount_to]'] = at;
  }

  if (gatewayOnly) {
    params['filter[is_gateway_payment]'] = 1;
  }

  return params;
}

export async function getPayments(
  params: GetPaymentsParams = {},
): Promise<PaymentsListApiResponse> {
  try {
    const { data } = await api.get<PaymentsListApiResponse>('/payments', {
      params: buildPaymentsQueryParams(params),
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
    throw new Error('Không tải được danh sách thanh toán');
  }
}

export type GetPaymentDetailParams = {
  include?: string;
  signal?: AbortSignal;
};

/** GET /payments/{uuid|id} */
export async function getPaymentDetail(
  paymentRef: string,
  params: GetPaymentDetailParams = {},
): Promise<PaymentDetailDataApi> {
  const ref = paymentRef.trim();
  if (!ref) {
    throw new Error('Thiếu thanh toán');
  }
  const include = params.include ?? PAYMENT_DETAIL_INCLUDE;
  try {
    const { data } = await api.get<PaymentDetailApiResponse>(
      `/payments/${encodeURIComponent(ref)}`,
      {
        params: { include },
        signal: params.signal,
      },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được thanh toán',
      );
    }
    return data.data;
  } catch {
    try {
      const { data } = await api.get<PaymentDetailApiResponse>(
        `/payments/${encodeURIComponent(ref)}`,
        {
          params: { include: PAYMENTS_LIST_INCLUDE },
          signal: params.signal,
        },
      );
      if (!data.success || data.data == null) {
        throw new Error(
          typeof data.message === 'string'
            ? data.message
            : 'Không tải được thanh toán',
        );
      }
      return data.data;
    } catch (e2: unknown) {
      if (axios.isAxiosError(e2)) {
        const d = e2.response?.data as { message?: string } | undefined;
        if (typeof d?.message === 'string') {
          throw new Error(d.message);
        }
      }
      if (e2 instanceof Error) {
        throw e2;
      }
      throw new Error('Không tải được thanh toán');
    }
  }
}

/** POST /payments/{ref}/attachments — multipart upload. */
export async function uploadPaymentAttachment(
  paymentRef: string,
  file: PaymentAttachmentUploadFile,
): Promise<PaymentAttachmentApi> {
  const ref = paymentRef.trim();
  if (!ref) {
    throw new Error('Thiếu thanh toán');
  }
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  try {
    const { data } = await api.post<PaymentAttachmentUploadApiResponse>(
      `/payments/${encodeURIComponent(ref)}/attachments`,
      form,
      {
        headers: AxiosHeaders.from({
          'Content-Type': 'multipart/form-data',
        }),
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải lên được tệp đính kèm',
      );
    }
    const raw = data.data;
    if (Array.isArray(raw)) {
      const first = raw[0];
      if (first) {
        return first;
      }
    } else if (raw) {
      return raw;
    }
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Phản hồi tải tệp không hợp lệ',
    );
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
    throw new Error('Không tải lên được tệp đính kèm');
  }
}
