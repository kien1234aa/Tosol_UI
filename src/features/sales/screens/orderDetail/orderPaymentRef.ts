import { getPayments } from '@services/finance/paymentAPI';
import type { PaymentListItemApi } from '@services/finance/paymentApiTypes';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';

function paymentOrderNumber(p: PaymentListItemApi): string {
  const so = p.sale_order ?? p.saleOrder ?? p.order;
  return (so?.order_number ?? '').trim();
}

function paymentRef(p: PaymentListItemApi): string | null {
  const uuid = p.uuid?.trim();
  if (uuid) {
    return uuid;
  }
  if (Number.isFinite(p.id)) {
    return String(p.id);
  }
  return null;
}

/**
 * Tìm giao dịch thanh toán gắn đơn — GET `/payments?filter[search]=mã đơn`.
 */
export async function resolvePaymentRefForSaleOrder(
  order: SaleOrder,
  opts?: { signal?: AbortSignal },
): Promise<string> {
  const embedded = order.payments ?? [];
  const withId = embedded.find(
    p => p.id != null && Number.isFinite(Number(p.id)),
  );
  if (withId?.id != null) {
    return String(withId.id);
  }

  const orderNum = order.order_number?.trim();
  if (!orderNum) {
    throw new Error('Thiếu mã đơn hàng');
  }
  const res = await getPayments({
    search: orderNum,
    per_page: 25,
    signal: opts?.signal,
  });
  const rows = res.data ?? [];
  const matched = rows.filter(p => {
    if (p.sale_order_id != null && p.sale_order_id === order.id) {
      return true;
    }
    return paymentOrderNumber(p) === orderNum;
  });
  if (matched.length === 0) {
    throw new Error('Chưa tìm thấy giao dịch thanh toán cho đơn này.');
  }
  const ref = paymentRef(matched[0]!);
  if (!ref) {
    throw new Error('Phản hồi thanh toán không hợp lệ');
  }
  return ref;
}
