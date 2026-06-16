import { scheduleAfterUIReady } from '@shared/utils/scheduleAfterUIReady';
import { parseNotificationTarget } from './notificationActionUrl';

/** Cùng hợp đồng mở chi tiết như `NotificationsListScreen` / `SalesMainStack` (không gọi goBack). */
export type NotificationDeepLinkHandlers = {
  onOpenOrder: (orderNumber: string) => void;
  onOpenInvoice?: (invoiceId: string) => void;
  onOpenSettlement?: (ref: string) => void;
  onOpenPayment?: (paymentRef: string) => void;
  onOpenPurchaseOrder?: (orderRef: string) => void;
  onOpenInboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenPackingOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenOutboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenTransferOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenComboAssembly?: (ref: {
    uuid: string | null;
    assemblyNumber: string;
    id: number;
  }) => void;
};

let handlers: NotificationDeepLinkHandlers | null = null;

export function setNotificationDeepLinkHandlers(
  next: NotificationDeepLinkHandlers | null,
): void {
  handlers = next;
}

/**
 * Mở đúng màn chi tiết từ `action_url` (giống tap một dòng trong danh sách thông báo).
 * Trả về `true` nếu URL parse được và có handler tương ứng.
 */
export function openNotificationDeepLinkFromActionUrl(
  actionUrl: string | null | undefined,
): boolean {
  if (actionUrl == null || String(actionUrl).trim() === '') {
    return false;
  }
  const parsed = parseNotificationTarget(String(actionUrl).trim());
  if (parsed == null || handlers == null) {
    return false;
  }
  const { kind, slug } = parsed;
  const orderRef = { uuid: null as string | null, orderNumber: slug, id: 0 };
  const assemblyRef = {
    uuid: null as string | null,
    assemblyNumber: slug,
    id: 0,
  };
  const h = handlers;

  const run = (): void => {
    if (kind === 'invoices' && h.onOpenInvoice) {
      h.onOpenInvoice(slug);
      return;
    }
    if (kind === 'settlements' && h.onOpenSettlement) {
      h.onOpenSettlement(slug);
      return;
    }
    if (kind === 'sale-orders') {
      h.onOpenOrder(slug);
      return;
    }
    if (kind === 'inbound-orders' && h.onOpenInboundOrder) {
      h.onOpenInboundOrder(orderRef);
      return;
    }
    if (kind === 'packing-orders' && h.onOpenPackingOrder) {
      h.onOpenPackingOrder(orderRef);
      return;
    }
    if (kind === 'outbound-orders' && h.onOpenOutboundOrder) {
      h.onOpenOutboundOrder(orderRef);
      return;
    }
    if (kind === 'transfer-orders' && h.onOpenTransferOrder) {
      h.onOpenTransferOrder(orderRef);
      return;
    }
    if (kind === 'payments' && h.onOpenPayment) {
      h.onOpenPayment(slug);
      return;
    }
    if (kind === 'purchase-orders' && h.onOpenPurchaseOrder) {
      h.onOpenPurchaseOrder(slug);
      return;
    }
    if (kind === 'combo-assemblies' && h.onOpenComboAssembly) {
      h.onOpenComboAssembly(assemblyRef);
    }
  };

  const canDispatch =
    (kind === 'invoices' && h.onOpenInvoice != null) ||
    (kind === 'settlements' && h.onOpenSettlement != null) ||
    kind === 'sale-orders' ||
    (kind === 'inbound-orders' && h.onOpenInboundOrder != null) ||
    (kind === 'packing-orders' && h.onOpenPackingOrder != null) ||
    (kind === 'outbound-orders' && h.onOpenOutboundOrder != null) ||
    (kind === 'transfer-orders' && h.onOpenTransferOrder != null) ||
    (kind === 'payments' && h.onOpenPayment != null) ||
    (kind === 'purchase-orders' && h.onOpenPurchaseOrder != null) ||
    (kind === 'combo-assemblies' && h.onOpenComboAssembly != null);

  if (!canDispatch) {
    return false;
  }

  scheduleAfterUIReady(run);
  return true;
}
