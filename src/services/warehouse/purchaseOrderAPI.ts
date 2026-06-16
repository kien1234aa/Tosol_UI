import axios from 'axios';
import api from '@shared/services/api';
import type {
  CancelPurchaseOrderPayload,
  CreatePurchaseOrderApiResponse,
  CreatePurchaseOrderPayload,
  PurchaseOrderApi,
  PurchaseOrderDetailApiResponse,
  PurchaseOrdersApiResponse,
  PurchaseOrdersMeta,
  UpdatePurchaseOrderPayload,
} from './purchaseOrderApiTypes';

const DEFAULT_INCLUDE = 'supplier,warehouse,currency,items.product';

/** GET `/purchase-orders/{ref}` — khớp query `include` trên API Forge. */
export const PURCHASE_ORDER_DETAIL_INCLUDE =
  'supplier,warehouse,items,items.product,currency,inboundOrders,attachments,attachments.uploader';

/** Danh sách đơn mua theo NCC (màn chi tiết nhà cung cấp). */
export const PURCHASE_ORDERS_SUPPLIER_DETAIL_INCLUDE =
  'warehouse,currency,items.product';

export type GetPurchaseOrdersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  /**
   * Quan hệ kèm theo (vd. `supplier,warehouse,currency,items.product`).
   * Truyền `null` để **không** gửi tham số `include` (phù hợp gọi `per_page=1` chỉ lấy `meta.total`).
   */
  include?: string | null;
  /** Gửi `filter[status]` (vd. `confirmed`, `partial_received`, `received`). */
  filterStatus?: string;
  /** Gửi `filter[supplier_id]` (admin / lọc theo NCC). */
  filterSupplierId?: number;
  /**
   * Nhận hàng hoàn trả — gửi `filter[is_return_receipt]=1`.
   * Nếu backend dùng khóa khác, sửa trong `buildQueryParams`.
   */
  filterReturnReceipt?: boolean;
  /**
   * Lọc theo tên NCC (khi chưa có `supplier_id`).
   * Gửi `filter[supplier_name]` — chỉnh nếu API dùng nested `filter[supplier][name]`.
   */
  filterSupplierName?: string;
  /** Tìm theo mã đơn / vận đơn (nếu API hỗ trợ). */
  search?: string;
  signal?: AbortSignal;
};

function buildQueryParams(
  p: GetPurchaseOrdersParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include: includeParam,
    filterStatus,
    filterSupplierId,
    filterReturnReceipt,
    filterSupplierName,
    search,
  } = p;

  const include =
    includeParam === null
      ? null
      : includeParam === undefined
      ? DEFAULT_INCLUDE
      : includeParam;

  const params: Record<string, string | number> = {
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
  if (
    filterSupplierId != null &&
    Number.isFinite(filterSupplierId) &&
    filterSupplierId > 0
  ) {
    params['filter[supplier_id]'] = filterSupplierId;
  }
  if (filterReturnReceipt === true) {
    params['filter[is_return_receipt]'] = 1;
  }
  const sn = filterSupplierName?.trim();
  if (sn && !(filterSupplierId != null && filterSupplierId > 0)) {
    params['filter[supplier_name]'] = sn;
  }
  const q = search?.trim();
  if (q) {
    params.search = q;
  }

  return params;
}

function unwrapList(res: PurchaseOrdersApiResponse): {
  items: PurchaseOrderApi[];
  meta: PurchaseOrdersMeta | null;
} {
  const raw = res.data;
  if (Array.isArray(raw)) {
    return { items: raw, meta: res.meta ?? null };
  }
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
    return { items: raw.data, meta: raw.meta ?? res.meta ?? null };
  }
  return { items: [], meta: res.meta ?? null };
}

export type PurchaseOrdersPageResult = {
  items: PurchaseOrderApi[];
  meta: PurchaseOrdersMeta | null;
};

/**
 * GET `/purchase-orders` — danh sách đơn mua hàng.
 */
export async function getPurchaseOrdersPage(
  params: GetPurchaseOrdersParams = {},
): Promise<PurchaseOrdersPageResult> {
  try {
    const { data } = await api.get<PurchaseOrdersApiResponse>(
      '/purchase-orders',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được đơn mua hàng',
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
    throw new Error('Không tải được đơn mua hàng');
  }
}

/**
 * GET `/purchase-orders/{orderRef}` — `orderRef` là `order_number` (vd. `PO-MCT-2600006`) hoặc id.
 */
export async function getPurchaseOrderDetail(
  orderRef: string,
  opts?: { signal?: AbortSignal; include?: string | null },
): Promise<PurchaseOrderApi> {
  const ref = encodeURIComponent(orderRef.trim());
  const include =
    opts?.include === null
      ? null
      : opts?.include ?? PURCHASE_ORDER_DETAIL_INCLUDE;
  try {
    const { data } = await api.get<PurchaseOrderDetailApiResponse>(
      `/purchase-orders/${ref}`,
      {
        params:
          include != null && String(include).trim() !== '' ? { include } : {},
        signal: opts?.signal,
      },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được đơn mua hàng',
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
    throw new Error('Không tải được đơn mua hàng');
  }
}

/** POST `/purchase-orders` — tạo đơn mua hàng. */
export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
  opts?: { signal?: AbortSignal },
): Promise<PurchaseOrderApi> {
  try {
    const { data } = await api.post<CreatePurchaseOrderApiResponse>(
      '/purchase-orders',
      payload,
      {
        signal: opts?.signal,
      },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được đơn mua hàng',
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
    throw new Error('Không tạo được đơn mua hàng');
  }
}

/** PUT `/purchase-orders/{orderRef}` — cập nhật đơn mua hàng (`orderRef`: mã đơn hoặc id). */
export async function updatePurchaseOrder(
  orderRef: string,
  payload: UpdatePurchaseOrderPayload,
  opts?: { signal?: AbortSignal },
): Promise<PurchaseOrderApi> {
  const ref = encodeURIComponent(orderRef.trim());
  try {
    const { data } = await api.put<CreatePurchaseOrderApiResponse>(
      `/purchase-orders/${ref}`,
      payload,
      {
        signal: opts?.signal,
      },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không cập nhật được đơn mua hàng',
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
    throw new Error('Không cập nhật được đơn mua hàng');
  }
}

/** POST `/purchase-orders/{orderRef}/cancel` — hủy đơn mua hàng. */
export async function cancelPurchaseOrder(
  orderRef: string,
  payload: CancelPurchaseOrderPayload,
  opts?: { signal?: AbortSignal },
): Promise<PurchaseOrderApi> {
  const ref = encodeURIComponent(orderRef.trim());
  try {
    const { data } = await api.post<PurchaseOrderDetailApiResponse>(
      `/purchase-orders/${ref}/cancel`,
      payload,
      { signal: opts?.signal },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không hủy được đơn mua hàng',
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
    throw new Error('Không hủy được đơn mua hàng');
  }
}
