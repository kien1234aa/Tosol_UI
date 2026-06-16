import axios from 'axios';
import api from '@shared/services/api';
import type {
  CreateSaleOrderApiResponse,
  CreateSaleOrderPayload,
  SaleOrder,
  SaleOrderCreatedRecord,
  SaleOrderDetailApiResponse,
  SaleOrdersApiResponse,
} from './saleOrderApiTypes';

/** Khớp API v2 danh sách đơn — `shop` + `shop.currency`. */
const DEFAULT_INCLUDE =
  'customer,shop,shop.currency,currency,items.product,creator';

/** GET chi tiết — khớp web TOSOL (path = mã đơn OR-…). */
export const SALE_ORDER_DETAIL_INCLUDE =
  'creator,seller,shop,shop.defaultPriceList,shop.defaultPriceList.currency,shop.defaultBankAccount,customer,packingWarehouse,shippingWarehouse,currency,items.product,shipment.shippingPartnerSeller.shippingPartner,shipment.shippingPartnerWarehouse.shippingPartnerConfig.shippingPartner,payments,payments.bankAccount,packingOrder,packingOrder.boxes,packingOrder.boxes.boxTemplate,outboundOrders,outboundOrders.items,outboundOrders.warehouse,returnOrders,returnOrders.items';

/** Danh sách đơn theo khách hàng (màn chi tiết khách). */
export const SALE_ORDERS_CUSTOMER_DETAIL_INCLUDE =
  'shop,packingWarehouse,currency,items.product';

/**
 * Tham số filter query GET /sale-orders (khớp API v2).
 * Ngày: `YYYY-MM-DD` → `filter[date_from]` / `filter[date_to]`.
 */
export type SaleOrderListFilters = {
  filterStatus?: string;
  /** `true` = chỉ đơn có vấn đề; `false` = chỉ đơn không có vấn đề; bỏ trống = không lọc. */
  filterHasIssue?: boolean;
  /** `filter[payment_status]` — vd. pending, partial_paid, paid, voided, pending_refund, refunded. */
  filterPaymentStatus?: string;
  /** `filter[date_from]` — ISO date only YYYY-MM-DD. */
  filterDateFrom?: string;
  /** `filter[date_to]` — ISO date only YYYY-MM-DD. */
  filterDateTo?: string;
  /** `filter[search]` — mã đơn, khách hàng, SĐT, … */
  filterSearch?: string;
};

export const EMPTY_SALE_ORDER_LIST_FILTERS: SaleOrderListFilters = {};

export type GetSaleOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  filters?: SaleOrderListFilters;
  /** Lọc đơn theo cửa hàng (query `filter[shop_id]`). */
  shopId?: number;
  /** Lọc đơn theo khách hàng (query `filter[customer_id]`). */
  customerId?: number;
};

function buildQueryParams(
  p: GetSaleOrdersParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 15,
    sort = '-created_at',
    include = DEFAULT_INCLUDE,
    filters,
    shopId,
    customerId,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
    include,
  };

  if (shopId != null && Number.isFinite(shopId)) {
    params['filter[shop_id]'] = shopId;
  }
  if (
    customerId != null &&
    Number.isFinite(customerId) &&
    customerId > 0
  ) {
    params['filter[customer_id]'] = customerId;
  }
  if (filters?.filterStatus) {
    params['filter[status]'] = filters.filterStatus;
  }
  if (filters?.filterHasIssue === true) {
    params['filter[has_issue]'] = 'true';
  } else if (filters?.filterHasIssue === false) {
    params['filter[has_issue]'] = 'false';
  }
  if (filters?.filterPaymentStatus?.trim()) {
    let ps = filters.filterPaymentStatus.trim();
    if (ps === 'partial' || ps === 'partially_paid') {
      ps = 'partial_paid';
    }
    params['filter[payment_status]'] = ps;
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

export async function getSaleOrders(
  params: GetSaleOrdersParams = {},
): Promise<SaleOrdersApiResponse> {
  const { data } = await api.get<SaleOrdersApiResponse>('/sale-orders', {
    params: buildQueryParams(params),
  });

  return data;
}

export type GetSaleOrderDetailParams = {
  include?: string;
  signal?: AbortSignal;
};

const SALE_ORDER_NUMBER_RE = /^OR-[A-Z0-9-]+$/i;

function readAxiosErrorMessage(e: unknown): string | null {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data as { message?: string } | undefined;
    if (typeof d?.message === 'string' && d.message.trim()) {
      return d.message.trim();
    }
  }
  if (e instanceof Error && e.message.trim()) {
    return e.message.trim();
  }
  return null;
}

function isSaleOrderNotFoundMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('no query results for model') ||
    m.includes('not found') ||
    m.includes('could not be found')
  );
}

function isSaleOrderNotFoundError(e: unknown): boolean {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    if (status === 404) {
      return true;
    }
    const msg = readAxiosErrorMessage(e);
    return msg != null && isSaleOrderNotFoundMessage(msg);
  }
  const msg = readAxiosErrorMessage(e);
  return msg != null && isSaleOrderNotFoundMessage(msg);
}

/** Thông báo lỗi thân thiện khi backend không tìm thấy đơn. */
export function formatSaleOrderApiError(message: string): string {
  if (isSaleOrderNotFoundMessage(message)) {
    const refMatch = message.match(/SaleOrder\]\s*(.+)$/i);
    const ref = refMatch?.[1]?.trim();
    return ref
      ? `Không tìm thấy đơn hàng ${ref}. Đơn có thể đã bị xóa hoặc bạn không có quyền xem.`
      : 'Không tìm thấy đơn hàng.';
  }
  return message;
}

function throwSaleOrderApiError(e: unknown, fallback: string): never {
  const raw = readAxiosErrorMessage(e);
  throw new Error(formatSaleOrderApiError(raw ?? fallback));
}

/** Khóa gọi API chi tiết / thao tác — ưu tiên `id` số (route binding backend). */
export function saleOrderApiRef(
  order: Pick<SaleOrder, 'id' | 'order_number'>,
): string {
  const num = order.order_number?.trim();
  if (num) {
    return num;
  }
  return String(order.id);
}

async function fetchSaleOrderDetailByPath(
  ref: string,
  include: string,
  signal?: AbortSignal,
): Promise<SaleOrder> {
  const path = `/sale-orders/${encodeURIComponent(ref)}`;
  const response = await api.get<SaleOrderDetailApiResponse>(path, {
    params: { include },
    signal,
  });
  const body = response.data;
  if (!body.success || body.data == null) {
    const msg =
      typeof body.message === 'string' ? body.message : 'Không tải được đơn hàng';
    throw new Error(formatSaleOrderApiError(msg));
  }
  return body.data;
}

async function resolveSaleOrderFromList(
  orderNumber: string,
): Promise<SaleOrder | null> {
  const res = await getSaleOrders({
    page: 1,
    per_page: 5,
    filters: { filterSearch: orderNumber },
    include: DEFAULT_INCLUDE,
  });
  const rows = res.data ?? [];
  const exact =
    rows.find(o => o.order_number?.trim() === orderNumber) ?? rows[0] ?? null;
  return exact;
}

/**
 * GET /sale-orders/{orderRef} — `orderRef` có thể là `id` số, `uuid`, hoặc mã đơn OR-….
 * Nếu mã đơn không resolve trực tiếp, tự tra danh sách rồi thử lại bằng `id`.
 * Query `include` mặc định: {@link SALE_ORDER_DETAIL_INCLUDE}.
 */
export async function getSaleOrderDetail(
  orderRef: string,
  params: GetSaleOrderDetailParams = {},
): Promise<SaleOrder> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const include = params.include ?? SALE_ORDER_DETAIL_INCLUDE;

  try {
    return await fetchSaleOrderDetailByPath(ref, include, params.signal);
  } catch (e: unknown) {
    if (!isSaleOrderNotFoundError(e)) {
      throwSaleOrderApiError(e, 'Không tải được đơn hàng');
    }

    if (SALE_ORDER_NUMBER_RE.test(ref)) {
      try {
        const hit = await resolveSaleOrderFromList(ref);
        if (hit?.id != null && Number.isFinite(hit.id)) {
          return await fetchSaleOrderDetailByPath(
            String(hit.id),
            include,
            params.signal,
          );
        }
      } catch (retryErr: unknown) {
        throwSaleOrderApiError(retryErr, 'Không tải được đơn hàng');
      }
    }

    throwSaleOrderApiError(e, 'Không tải được đơn hàng');
  }
}

/** Tạo đơn bán — POST /sale-orders */
export async function createSaleOrder(
  payload: CreateSaleOrderPayload,
  opts?: { signal?: AbortSignal },
): Promise<SaleOrderCreatedRecord> {
  try {
    const response = await api.post<CreateSaleOrderApiResponse>(
      '/sale-orders',
      payload,
      { signal: opts?.signal },
    );
    const body = response.data;
    if (!body.success || body.data == null) {
      throw new Error(
        typeof body.message === 'string'
          ? body.message
          : 'Không tạo được đơn hàng',
      );
    }
    return body.data;
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
    throw new Error('Không tạo được đơn hàng');
  }
}

/** POST /sale-orders/{orderRef}/mark-issue — `issue_reason` hiển thị/ghi chú vấn đề đơn hàng. */
export async function markSaleOrderIssue(
  orderRef: string,
  issueReason: string,
  opts?: { signal?: AbortSignal },
): Promise<SaleOrder> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const reason = issueReason.trim();
  if (!reason) {
    throw new Error('Vui lòng nhập mô tả vấn đề');
  }
  const path = `/sale-orders/${encodeURIComponent(ref)}/mark-issue`;
  try {
    const response = await api.post<SaleOrderDetailApiResponse>(
      path,
      { issue_reason: reason },
      { signal: opts?.signal },
    );
    const body = response.data;
    if (!body.success || body.data == null) {
      throw new Error(
        typeof body.message === 'string'
          ? body.message
          : 'Không đánh dấu được vấn đề',
      );
    }
    return body.data;
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
    throw new Error('Không đánh dấu được vấn đề');
  }
}

/** POST /sale-orders/{orderRef}/cancel-packing — body `{ reason }`, đơn về trạng thái chờ xác nhận (`pending`). */
export async function cancelSaleOrderPacking(
  orderRef: string,
  reason: string,
  opts?: { signal?: AbortSignal },
): Promise<SaleOrder> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const r = reason.trim();
  if (!r) {
    throw new Error('Vui lòng nhập lý do hủy đóng gói');
  }
  const path = `/sale-orders/${encodeURIComponent(ref)}/cancel-packing`;
  try {
    const response = await api.post<SaleOrderDetailApiResponse>(
      path,
      { reason: r },
      { signal: opts?.signal },
    );
    const body = response.data;
    if (!body.success || body.data == null) {
      throw new Error(
        typeof body.message === 'string'
          ? body.message
          : 'Không hủy đóng gói được',
      );
    }
    return body.data;
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
    throw new Error('Không hủy đóng gói được');
  }
}

/** POST /sale-orders/{orderRef}/confirm — xác nhận đơn chờ xử lý, trạng thái chuyển sang `packing` (đang đóng gói). */
export async function confirmSaleOrder(
  orderRef: string,
  opts?: { signal?: AbortSignal },
): Promise<SaleOrder> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const path = `/sale-orders/${encodeURIComponent(ref)}/confirm`;
  try {
    const response = await api.post<SaleOrderDetailApiResponse>(
      path,
      {},
      { signal: opts?.signal },
    );
    const body = response.data;
    if (!body.success || body.data == null) {
      throw new Error(
        typeof body.message === 'string'
          ? body.message
          : 'Không xác nhận được đơn hàng',
      );
    }
    return body.data;
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
    throw new Error('Không xác nhận được đơn hàng');
  }
}

/** POST /sale-orders/{orderRef}/cancel — body `{ cancel_reason }`, trạng thái `cancelled`. */
export async function cancelSaleOrder(
  orderRef: string,
  cancelReason: string,
  opts?: { signal?: AbortSignal },
): Promise<SaleOrder> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const r = cancelReason.trim();
  if (!r) {
    throw new Error('Vui lòng nhập lý do hủy đơn');
  }
  const path = `/sale-orders/${encodeURIComponent(ref)}/cancel`;
  try {
    const response = await api.post<SaleOrderDetailApiResponse>(
      path,
      { cancel_reason: r },
      { signal: opts?.signal },
    );
    const body = response.data;
    if (!body.success || body.data == null) {
      throw new Error(
        typeof body.message === 'string'
          ? body.message
          : 'Không hủy được đơn hàng',
      );
    }
    return body.data;
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
    throw new Error('Không hủy được đơn hàng');
  }
}

/**
 * POST /sale-orders/{orderRef}/resolve-issue — gỡ đánh dấu vấn đề sau khi đã xử lý.
 * (Đặt tên route đối xứng `mark-issue`; nếu backend khác, chỉnh path tại đây.)
 */
export async function resolveSaleOrderIssue(
  orderRef: string,
  opts?: { signal?: AbortSignal },
): Promise<SaleOrder> {
  const ref = orderRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const path = `/sale-orders/${encodeURIComponent(ref)}/resolve-issue`;
  try {
    const response = await api.post<SaleOrderDetailApiResponse>(
      path,
      {},
      { signal: opts?.signal },
    );
    const body = response.data;
    if (!body.success || body.data == null) {
      throw new Error(
        typeof body.message === 'string'
          ? body.message
          : 'Không cập nhật được trạng thái vấn đề',
      );
    }
    return body.data;
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
    throw new Error('Không cập nhật được trạng thái vấn đề');
  }
}
