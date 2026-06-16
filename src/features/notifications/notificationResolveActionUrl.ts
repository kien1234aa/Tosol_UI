import type { ApiNotification } from '@services/system/notificationsApi';
import {
  readInboundOrderNumberFromNotificationData,
  readInboundOrderNumberFromNotificationText,
} from './inboundOrderFromNotificationData';
import { parseNotificationTarget } from './notificationActionUrl';

function dataStr(data: Record<string, unknown>, key: string): string | null {
  const v = data[key];
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

function looksLikeInboundOrderNumber(s: string): boolean {
  return s.trim().toUpperCase().startsWith('IBP-');
}

/** Mã hóa đơn dạng INV-… trong title/body (khi API chưa gửi action_url). */
function invoiceRefFromText(title: string, message: string): string | null {
  const blob = `${title}\n${message}`;
  const m = blob.match(/\b(INV-[A-Z0-9]+(?:-[A-Z0-9]+)+)\b/i);
  return m?.[1]?.trim() ?? null;
}

/**
 * Tạo đường dẫn kiểu `action_url` khi API để null nhưng `data` / nội dung có mã thực thể.
 */
function buildSyntheticActionUrl(n: ApiNotification): string | null {
  const data = (n.data ?? {}) as Record<string, unknown>;

  const inbound =
    readInboundOrderNumberFromNotificationData(data) ??
    readInboundOrderNumberFromNotificationText(n.title, n.message);
  if (inbound) {
    return `inbound-orders/${inbound}`;
  }

  const invoice =
    dataStr(data, 'invoice_number') ??
    dataStr(data, 'invoiceNumber') ??
    dataStr(data, 'document_number') ??
    dataStr(data, 'invoice_ref') ??
    dataStr(data, 'invoice_slug');
  if (invoice) {
    return `invoices/${invoice}`;
  }
  const invoiceId = dataStr(data, 'invoice_id');
  if (invoiceId != null && /^\d+$/.test(invoiceId)) {
    return `invoices/${invoiceId}`;
  }
  const invFromMsg = invoiceRefFromText(n.title, n.message);
  if (invFromMsg) {
    return `invoices/${invFromMsg}`;
  }

  const sale =
    dataStr(data, 'sale_order_number') ??
    dataStr(data, 'saleOrderNumber') ??
    dataStr(data, 'order_number') ??
    dataStr(data, 'orderNumber');
  if (sale != null && !looksLikeInboundOrderNumber(sale)) {
    return `sale-orders/${sale}`;
  }

  const payment =
    dataStr(data, 'payment_ref') ??
    dataStr(data, 'payment_uuid') ??
    dataStr(data, 'payment_id');
  if (payment) {
    return `payments/${payment}`;
  }

  const settlement =
    dataStr(data, 'settlement_number') ??
    dataStr(data, 'settlement_ref') ??
    dataStr(data, 'settlementNumber');
  if (settlement) {
    return `settlements/${settlement}`;
  }

  const packing =
    dataStr(data, 'packing_order_number') ??
    dataStr(data, 'packing_order_no') ??
    dataStr(data, 'packingOrderNumber');
  if (packing) {
    return `packing-orders/${packing}`;
  }

  const outbound =
    dataStr(data, 'outbound_order_number') ??
    dataStr(data, 'outbound_order_no') ??
    dataStr(data, 'outboundOrderNumber');
  if (outbound) {
    return `outbound-orders/${outbound}`;
  }

  const transfer =
    dataStr(data, 'transfer_order_number') ??
    dataStr(data, 'transfer_order_no') ??
    dataStr(data, 'transferOrderNumber');
  if (transfer) {
    return `transfer-orders/${transfer}`;
  }

  const purchase =
    dataStr(data, 'purchase_order_number') ??
    dataStr(data, 'purchase_order_no') ??
    dataStr(data, 'purchase_order_ref') ??
    dataStr(data, 'purchaseOrderNumber');
  if (purchase) {
    return `purchase-orders/${purchase}`;
  }

  const assembly =
    dataStr(data, 'assembly_number') ??
    dataStr(data, 'combo_assembly_number') ??
    dataStr(data, 'assemblyNumber');
  if (assembly) {
    return `combo-assemblies/${assembly}`;
  }

  return null;
}

/**
 * URL để parse → mở đúng màn chi tiết (ưu tiên `action_url` hợp lệ, sau đó suy ra từ `data`/title/message).
 */
export function resolveNotificationActionUrl(
  n: ApiNotification,
): string | null {
  const primary = (n.action_url ?? '').trim();
  const synthetic = buildSyntheticActionUrl(n);

  if (primary !== '' && parseNotificationTarget(primary) != null) {
    return primary;
  }
  if (synthetic != null && parseNotificationTarget(synthetic) != null) {
    return synthetic;
  }
  return null;
}
