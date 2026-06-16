import type {
  OrderListProductPreview,
  OrderListRow,
  OrderPaymentStatus,
  OrderRowStatus,
} from '@features/sales/orders/orderTypes';
import type {
  SaleOrder,
  SaleOrderItem,
} from '@services/sales/saleOrderApiTypes';

export function mapApiOrderStatus(status: string): OrderRowStatus {
  switch (status) {
    case 'cancelled':
      return 'cancelled';
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'confirmed';
    case 'packing':
      return 'packing';
    case 'shipped':
      return 'shipping';
    case 'delivered':
      return 'delivered';
    case 'ready_to_ship':
      return 'ready';
    case 'transferring':
      return 'transferring';
    case 'pending_transfer':
    case 'awaiting_transfer':
      return 'pending_transfer';
    case 'transfer_failed':
    case 'transfer_error':
      return 'transfer_failed';
    case 'returned':
    case 'fully_returned':
      return 'returned';
    case 'partially_returned':
    case 'partial_return':
      return 'partially_returned';
    default:
      return 'pending';
  }
}

export function mapApiPaymentStatus(status: string): OrderPaymentStatus {
  switch (status) {
    case 'voided':
      return 'disabled';
    case 'paid':
      return 'paid';
    case 'partial':
    case 'partially_paid':
    case 'partial_paid':
      return 'partial_payment';
    case 'pending_refund':
      return 'pending_refund';
    case 'refunded':
      return 'refunded';
    case 'pending':
    default:
      return 'pending_payment';
  }
}

function formatMoneyVnd(amountStr: string, decimalPlaces: number): string {
  const n = Number(amountStr);
  if (!Number.isFinite(n)) {
    return amountStr;
  }
  const rounded = decimalPlaces <= 0 ? Math.round(n) : n;
  return `${rounded.toLocaleString('vi-VN')}\u0111`;
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('vi-VN');
}

function saleOrderItemToPreview(
  it: SaleOrderItem | undefined,
): OrderListProductPreview | null {
  if (!it) {
    return null;
  }
  const product = it.product ?? undefined;
  const thumbUrl = product?.thumbnail_url ?? product?.image_url ?? null;
  const name = (it.name ?? product?.name ?? '').trim() || '—';
  return { name, thumbUrl };
}

export function saleOrderToListRow(order: SaleOrder): OrderListRow {
  const items = order.items ?? [];
  const itemCount = items.length;
  const first = saleOrderItemToPreview(items[0]);
  const second = itemCount >= 2 ? saleOrderItemToPreview(items[1]) : null;
  const moreProductsCount = itemCount > 2 ? itemCount : 0;

  const productName = first?.name ?? '—';
  const thumbUrl = first?.thumbUrl ?? null;

  const currency = order.currency ?? order.shop?.currency ?? null;
  const decimals = currency?.decimal_places ?? 0;

  const customerName = order.customer?.name ?? '—';
  const customerPhone = order.customer?.phone ?? '';
  const storeName = order.shop?.name?.trim() || '—';
  const packingWarehouseName =
    order.packing_warehouse?.name?.trim() ||
    order.shipping_warehouse?.name?.trim() ||
    '—';

  return {
    id: order.order_number,
    key: String(order.id),
    itemCount,
    productName,
    thumbUrl,
    secondProduct: second,
    moreProductsCount,
    customerName,
    customerPhone,
    storeName,
    packingWarehouseName,
    totalAmount: formatMoneyVnd(order.total, decimals),
    status: mapApiOrderStatus(order.status),
    payment: mapApiPaymentStatus(order.payment_status),
    creatorName: order.creator?.name ?? '—',
    createdAtDisplay: formatCreatedAt(order.created_at),
  };
}