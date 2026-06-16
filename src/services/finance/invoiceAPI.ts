import axios from 'axios';
import api from '@shared/services/api';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';
import { pickInvoiceRefFromSaleOrder } from '@features/sales/screens/orderDetail/orderInvoiceRef';
import type {
  InvoiceApi,
  InvoiceDetailApiResponse,
  InvoicesListApiResponse,
} from './invoiceApiTypes';

/** Khớp API Forge — include seller + tổng theo tiền tệ. */
export const INVOICES_LIST_INCLUDE = 'seller,totals,totals.currency';

/** Chi tiết — thêm kho, dòng mục, đối soát (nếu backend hỗ trợ). */
export const INVOICE_DETAIL_INCLUDE =
  'seller,totals,totals.currency,warehouse,items,settlement';

export type GetInvoicesParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  /** Gửi lên query `filter[status]` (pending, partially_paid, paid, overdue, draft, cancelled). */
  filterStatus?: string;
  /** Tìm theo số hóa đơn / từ khóa — `filter[search]` (nếu backend hỗ trợ). */
  search?: string;
  signal?: AbortSignal;
};

function buildInvoicesQueryParams(
  p: GetInvoicesParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include = INVOICES_LIST_INCLUDE,
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

export async function getInvoices(
  params: GetInvoicesParams = {},
): Promise<InvoicesListApiResponse> {
  try {
    const { data } = await api.get<InvoicesListApiResponse>('/invoices', {
      params: buildInvoicesQueryParams(params),
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
    throw new Error('Không tải được danh sách hóa đơn');
  }
}

export type GetInvoiceDetailParams = {
  include?: string;
  signal?: AbortSignal;
};

function isNumericIdRef(ref: string): boolean {
  return /^\d+$/.test(ref.trim());
}

async function getInvoiceDetailById(
  id: string,
  params: GetInvoiceDetailParams,
): Promise<InvoiceApi> {
  const ref = id.trim();
  const include = params.include ?? INVOICE_DETAIL_INCLUDE;
  const { data } = await api.get<InvoiceDetailApiResponse>(
    `/invoices/${encodeURIComponent(ref)}`,
    {
      params: { include },
      signal: params.signal,
    },
  );
  if (!data.success || data.data == null) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Không tải được hóa đơn',
    );
  }
  return data.data;
}

async function resolveInvoiceIdFromInvoiceNumber(
  invoiceNumber: string,
  signal: AbortSignal | undefined,
): Promise<number> {
  const res = await getInvoices({
    search: invoiceNumber.trim(),
    per_page: 25,
    page: 1,
    signal,
  });
  const rows = res.data ?? [];
  const exact = rows.find(
    r => (r.invoice_number ?? '').trim() === invoiceNumber.trim(),
  );
  const pick = exact ?? (rows.length === 1 ? rows[0] : undefined);
  if (pick == null) {
    if (rows.length === 0) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    throw new Error(
      'Không xác định được hóa đơn — vui lòng mở từ danh sách hóa đơn',
    );
  }
  return pick.id;
}

/**
 * GET /invoices/{id} — `invoiceRef` có thể là id số (từ danh sách) hoặc `invoice_number` (vd. từ thông báo: INV-S1-202603-0002).
 */
export async function getInvoiceDetail(
  invoiceRef: string,
  params: GetInvoiceDetailParams = {},
): Promise<InvoiceApi> {
  const ref = invoiceRef.trim();
  if (!ref) {
    throw new Error('Thiếu hóa đơn');
  }
  try {
    if (isNumericIdRef(ref)) {
      return await getInvoiceDetailById(ref, params);
    }
    try {
      return await getInvoiceDetailById(ref, params);
    } catch (first: unknown) {
      const status = axios.isAxiosError(first)
        ? first.response?.status
        : undefined;
      const msg =
        axios.isAxiosError(first) &&
        typeof (first.response?.data as { message?: string } | undefined)
          ?.message === 'string'
          ? (first.response!.data as { message: string }).message
          : '';
      const notFoundish =
        status === 404 ||
        /no query results for model/i.test(msg) ||
        /not found/i.test(msg);
      if (!notFoundish) {
        if (first instanceof Error) {
          throw first;
        }
        throw new Error('Không tải được hóa đơn');
      }
      const id = await resolveInvoiceIdFromInvoiceNumber(ref, params.signal);
      return await getInvoiceDetailById(String(id), params);
    }
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
    throw new Error('Không tải được hóa đơn');
  }
}

/**
 * Tìm ref mở chi tiết hóa đơn từ đơn bán (field trên đơn hoặc tìm trong `/invoices`).
 * Không gọi `/sale-orders/{ref}/invoices` — route này không có trên API.
 */
export async function resolveInvoiceRefForSaleOrder(
  order: SaleOrder,
  opts?: { signal?: AbortSignal },
): Promise<string> {
  const direct = pickInvoiceRefFromSaleOrder(order);
  if (direct) {
    return direct;
  }

  const orderNum = order.order_number?.trim();
  if (orderNum) {
    try {
      const res = await getInvoices({
        search: orderNum,
        per_page: 25,
        signal: opts?.signal,
      });
      const rows = res.data ?? [];
      if (rows.length === 1) {
        const row = rows[0]!;
        return row.invoice_number?.trim() || String(row.id);
      }
    } catch {
      /* filter[search] có thể chưa hỗ trợ — bỏ qua */
    }
  }

  throw new Error('Chưa tìm thấy hóa đơn liên quan đơn này.');
}
