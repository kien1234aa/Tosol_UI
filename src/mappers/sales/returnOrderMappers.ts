import type { ReturnOrderRecord } from '@services/sales/returnOrderApiTypes';
import { formatMoneyFromApi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type {
  ReturnOrderListRow,
  ReturnOrderRefundStatusUi,
  ReturnOrderRowStatus,
  ReturnOrderRowType,
} from '@features/sales/returnOrders/returnOrderListTypes';

function pickSaleOrder(r: ReturnOrderRecord) {
  return r.sale_order ?? r.saleOrder ?? null;
}

function mapStatus(raw: string | undefined): ReturnOrderRowStatus {
  const v = raw?.trim().toLowerCase() ?? '';
  if (v === 'pending') {
    return 'pending';
  }
  if (v === 'approved') {
    return 'approved';
  }
  if (v === 'receiving') {
    return 'receiving';
  }
  if (v === 'completed') {
    return 'completed';
  }
  if (v === 'rejected') {
    return 'rejected';
  }
  if (v === 'cancelled') {
    return 'cancelled';
  }
  return 'unknown';
}

function mapReturnType(raw: string | undefined): ReturnOrderRowType {
  const v = raw?.trim().toLowerCase() ?? '';
  if (v === 'partial' || v === 'partial_return' || v.includes('partial')) {
    return 'partial';
  }
  if (
    v === 'full' ||
    v === 'full_return' ||
    v === 'complete' ||
    v.includes('full')
  ) {
    return 'full';
  }
  return 'unknown';
}

function returnTypeLabel(type: ReturnOrderRowType): string | null {
  if (type === 'partial') {
    return 'Trả một phần';
  }
  if (type === 'full') {
    return 'Trả toàn bộ';
  }
  return null;
}

function mapRefundStatus(raw: string | undefined): ReturnOrderRefundStatusUi {
  const v = raw?.trim().toLowerCase() ?? '';
  if (v === 'pending' || v === 'unpaid') {
    return 'pending';
  }
  if (v === 'processing' || v === 'pending_refund') {
    return 'processing';
  }
  if (v === 'completed' || v === 'paid' || v === 'refunded') {
    return 'completed';
  }
  if (v === 'cancelled' || v === 'voided') {
    return 'cancelled';
  }
  return 'unknown';
}

function refundStatusLabel(status: ReturnOrderRefundStatusUi): string | null {
  switch (status) {
    case 'pending':
      return 'Chờ hoàn tiền';
    case 'processing':
      return 'Đang xử lý';
    case 'completed':
      return 'Đã hoàn tiền';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return null;
  }
}

function formatRefundOrNull(amount: string | null | undefined): string | null {
  if (amount == null || String(amount).trim() === '') {
    return null;
  }
  const formatted = formatMoneyFromApi(amount, 0);
  return formatted === '—' ? null : formatted;
}

/** Nối meta card — bỏ qua giá trị rỗng. */
export function joinReturnOrderMetaLine(
  parts: (string | null | undefined)[],
): string | null {
  const filtered = parts
    .map(p => (p ?? '').trim())
    .filter(p => p.length > 0);
  return filtered.length > 0 ? filtered.join(' · ') : null;
}

function returnCodeOf(r: ReturnOrderRecord): string {
  const c =
    r.return_number?.trim() ||
    r.number?.trim() ||
    r.order_number?.trim() ||
    (r.uuid ? r.uuid.slice(0, 8) : '');
  return c || `#${r.id}`;
}

export function returnOrderToListRow(r: ReturnOrderRecord): ReturnOrderListRow {
  const so = pickSaleOrder(r);
  const items = r.items ?? [];
  const nItems = items.length;
  const first = items[0];
  const prod = first?.product;
  const lineName = (prod?.name ?? first?.name ?? '').trim();
  const productName =
    lineName || (nItems > 0 ? `${nItems} dòng hàng` : null);
  const second = items[1];
  const secondProd = second?.product;
  const productSecondLabel =
    nItems >= 2
      ? (secondProd?.name ?? second?.name ?? '').trim() || null
      : null;
  const moreProductsCount = nItems > 2 ? nItems - 2 : 0;
  const thumb = prod?.thumbnail_url?.trim() || prod?.image_url?.trim() || null;
  const amt = r.refund_amount ?? r.total_refund ?? null;
  const reasonRaw = (r.return_reason ?? r.reason ?? '').trim();
  const returnType = mapReturnType(r.return_type ?? r.type ?? undefined);
  const refundStatus = mapRefundStatus(r.refund_status ?? undefined);

  return {
    key: String(r.uuid ?? r.id),
    returnCode: returnCodeOf(r),
    sellerName: r.seller?.name?.trim() || null,
    originOrderNumber: so?.order_number?.trim() || null,
    productName,
    productSecondLabel,
    moreProductsCount,
    thumbUrl: thumb,
    status: mapStatus(r.status),
    returnType,
    returnTypeLabel: returnTypeLabel(returnType),
    reason: reasonRaw || null,
    refundDisplay: formatRefundOrNull(amt),
    refundStatus,
    refundStatusLabel: refundStatusLabel(refundStatus),
  };
}
