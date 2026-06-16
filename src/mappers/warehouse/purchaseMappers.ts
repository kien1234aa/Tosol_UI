import {
  formatMoneyFromApi,
  formatDateVi,
} from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { PurchaseOrderApi } from '@services/warehouse/purchaseOrderApiTypes';
import type {
  PurchaseOrderListRow,
  PurchaseOrderRowStatus,
} from '@features/goods/purchase/purchaseTypes';

/** Giá trị `filter[status]` — khớp API TOSOL (`GET /purchase-orders`). */
export const PO_FILTER_CONFIRMED = 'confirmed';
export const PO_FILTER_PARTIAL = 'partial_received';
export const PO_FILTER_RECEIVED = 'received';
export const PO_FILTER_CANCELLED = 'cancelled';

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : 0;
  }
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function mapApiPoRowStatus(
  status: string | null | undefined,
): PurchaseOrderRowStatus {
  const s = (status ?? '').toLowerCase().trim();
  if (!s) {
    return 'unknown';
  }
  if (s === 'received' || s === 'fully_received' || s === 'complete') {
    return 'received';
  }
  if (
    s === 'partial_received' ||
    s === 'partially_received' ||
    s === 'partial'
  ) {
    return 'partial';
  }
  if (s === 'confirmed' || s === 'approved') {
    return 'confirmed';
  }
  if (s === 'draft' || s === 'pending') {
    return 'draft';
  }
  if (s.includes('cancel')) {
    return 'cancelled';
  }
  return 'unknown';
}

export function poStatusLabel(row: PurchaseOrderRowStatus): string {
  switch (row) {
    case 'confirmed':
      return 'Đã xác nhận';
    case 'partial':
      return 'Nhận một phần';
    case 'received':
      return 'Đã nhận đủ';
    case 'draft':
      return 'Nháp';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Khác';
  }
}

/** Nối meta card — bỏ qua giá trị rỗng. */
export function joinPurchaseMetaLine(
  parts: (string | null | undefined)[],
): string | null {
  const filtered = parts
    .map(p => (p ?? '').trim())
    .filter(p => p.length > 0);
  return filtered.length > 0 ? filtered.join(' · ') : null;
}

function formatMoneyOrNull(
  amountStr: string | null | undefined,
  decimalPlaces: number,
): string | null {
  if (amountStr == null || String(amountStr).trim() === '') {
    return null;
  }
  return formatMoneyFromApi(amountStr, decimalPlaces);
}

function formatExpectedDateOrNull(
  iso: string | null | undefined,
): string | null {
  if (iso == null || iso.trim() === '') {
    return null;
  }
  const formatted = formatDateVi(iso);
  return formatted === '—' ? null : formatted;
}

function firstLine(po: PurchaseOrderApi) {
  return po.items?.[0];
}

export function purchaseOrderToListRow(
  po: PurchaseOrderApi,
): PurchaseOrderListRow {
  const rowStatus = mapApiPoRowStatus(po.status ?? null);
  const decimals = po.currency?.decimal_places ?? 0;
  const first = firstLine(po);
  const product = first?.product ?? null;
  const items = po.items ?? [];
  const nItems = items.length;
  const lineName = (product?.name ?? first?.name ?? '').trim();
  const productLabel =
    lineName || (nItems > 0 ? `${nItems} dòng hàng` : null);

  const secondLine = items[1];
  const secondProduct = secondLine?.product ?? null;
  const secondName = (secondProduct?.name ?? secondLine?.name ?? '').trim();
  const productSecondLabel =
    nItems >= 2 ? (secondName.length > 0 ? secondName : null) : null;
  const moreProductsCount = nItems > 2 ? nItems - 2 : 0;

  let expectedQty = Math.round(toNum(po.total_expected_quantity));
  let receivedQty = Math.round(toNum(po.total_received_quantity));
  if (expectedQty <= 0 && receivedQty <= 0 && po.items?.length) {
    for (const it of po.items) {
      const exp =
        toNum(it.expected_quantity) > 0
          ? toNum(it.expected_quantity)
          : toNum(it.quantity);
      expectedQty += Math.round(exp);
      receivedQty += Math.round(toNum(it.received_quantity));
    }
  }
  if (expectedQty <= 0 && receivedQty > 0) {
    expectedQty = receivedQty;
  }
  if (receivedQty > expectedQty && expectedQty > 0) {
    receivedQty = expectedQty;
  }
  const progressPct =
    expectedQty > 0
      ? Math.min(100, Math.round((receivedQty / expectedQty) * 100))
      : receivedQty > 0
        ? 100
        : 0;

  const thumb =
    product?.thumbnail_url?.trim() || product?.image_url?.trim() || null;

  return {
    id: po.id,
    orderNumber: (po.order_number ?? '').trim() || `PO#${po.id}`,
    supplierName: po.supplier?.name?.trim() || null,
    warehouseName: po.warehouse?.name?.trim() || null,
    productLabel,
    productSecondLabel,
    moreProductsCount,
    productThumb: thumb,
    rowStatus,
    statusLabel: poStatusLabel(rowStatus),
    expectedQty,
    receivedQty,
    progressPct,
    totalLabel: formatMoneyOrNull(po.total ?? null, decimals),
    expectedDateLabel: formatExpectedDateOrNull(po.expected_at ?? null),
  };
}
