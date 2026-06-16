/**
 * Mã phiếu nhập kho TOSOL (vd. GET `/inbound-orders/IBP-MCT-26000001`).
 * Chỉ tin `order_number` / `reference` khi khớp tiền tố — tránh nhầm mã đơn bán.
 */
function looksLikeTosolInboundOrderNumber(s: string): boolean {
  const t = s.trim().toUpperCase();
  return t.startsWith('IBP-');
}

function readStringField(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const v = data[key];
  if (typeof v === 'string' && v.trim() !== '') {
    return v.trim();
  }
  return null;
}

/**
 * Một số thông báo nhập kho gửi `action_url` trỏ PO nhưng kèm mã phiếu nhập trong `data`.
 * FCM hay dùng thêm `order_number` — chỉ nhận khi trông giống mã phiếu nhập kho (IBP-…).
 */
export function readInboundOrderNumberFromNotificationData(
  data: Record<string, unknown> | undefined | null,
): string | null {
  if (data == null) {
    return null;
  }
  const explicitKeys = [
    'inbound_order_number',
    'inbound_order_no',
    'inboundOrderNumber',
  ] as const;
  for (const k of explicitKeys) {
    const s = readStringField(data, k);
    if (s != null) {
      return s;
    }
  }
  for (const k of [
    'order_number',
    'orderNumber',
    'reference',
    'ref',
  ] as const) {
    const s = readStringField(data, k);
    if (s != null && looksLikeTosolInboundOrderNumber(s)) {
      return s;
    }
  }
  const nested = data.inbound_order;
  if (nested != null && typeof nested === 'object' && !Array.isArray(nested)) {
    const o = nested as Record<string, unknown>;
    const on = o.order_number ?? o.orderNumber ?? o.number;
    if (typeof on === 'string' && on.trim() !== '') {
      return on.trim();
    }
  }
  return null;
}

/**
 * Khi payload `data` thiếu mã nhưng title/body có mã (vd. "Đơn nhập kho IBP-MCT-26000001 đã đến…").
 */
export function readInboundOrderNumberFromNotificationText(
  title: string | undefined,
  body: string | undefined,
): string | null {
  const blob = `${title ?? ''}\n${body ?? ''}`;
  const m = blob.match(/\b(IBP-[A-Z0-9]+(?:-[A-Z0-9]+)+)\b/i);
  return m?.[1]?.trim() ?? null;
}
