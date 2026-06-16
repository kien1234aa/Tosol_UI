import type {
  SaleOrder,
  SaleOrderInvoiceRef,
} from '@services/sales/saleOrderApiTypes';

function refFromInvoiceLike(
  inv: SaleOrderInvoiceRef | null | undefined,
): string | null {
  if (!inv) {
    return null;
  }
  const num = (inv.invoice_number ?? '').trim();
  if (num) {
    return num;
  }
  if (inv.id != null && Number.isFinite(inv.id)) {
    return String(inv.id);
  }
  return null;
}

/**
 * Lấy ref mở `InvoiceDetailScreen` từ payload đơn (khi API include `invoice` / `invoices`).
 */
export function pickInvoiceRefFromSaleOrder(order: SaleOrder): string | null {
  const directNum = order.invoice_number?.trim();
  if (directNum) {
    return directNum;
  }
  if (order.invoice_id != null && Number.isFinite(order.invoice_id)) {
    return String(order.invoice_id);
  }

  const fromInv = refFromInvoiceLike(order.invoice);
  if (fromInv) {
    return fromInv;
  }

  const list = order.invoices;
  if (Array.isArray(list) && list.length > 0) {
    return refFromInvoiceLike(list[0]);
  }

  return null;
}
