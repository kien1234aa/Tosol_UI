import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import type { QuickActionTone } from '@shared/theme/quickActionPaint';

export type QuickActionItem = {
  key: string;
  /** Khóa i18n, ví dụ `orders.quickActions.viewInvoice` */
  labelKey: string;
  icon: SystemIconName;
  tone: QuickActionTone;
};

const row = (
  key: string,
  labelKey: string,
  icon: SystemIconName,
  tone: QuickActionTone,
): QuickActionItem => ({
  key,
  labelKey,
  icon,
  tone,
});

/**
 * Đổi nút đầu tiên (`payment`) theo trạng thái thanh toán:
 * - Đã thanh toán → "Xem thanh toán" (mở màn thanh toán).
 * - Chưa thanh toán → "Xem hóa đơn" (mở màn hóa đơn).
 */
function withPaymentOrInvoiceAction(
  actions: QuickActionItem[],
  isPaid: boolean,
): QuickActionItem[] {
  if (isPaid) {
    return actions;
  }
  return actions.map(a =>
    a.key === 'payment'
      ? row('invoice', 'orders.quickActions.viewInvoice', 'document', 'neutral')
      : a,
  );
}

/** Chèn nút giải quyết vấn đề sau nút Đánh dấu vấn đề khi đơn đang có cờ vấn đề. */
function withResolveIssueAction(
  actions: QuickActionItem[],
  hasOpenIssue: boolean,
): QuickActionItem[] {
  if (!hasOpenIssue) {
    return actions;
  }
  const resolveRow = row(
    'resolve_issue',
    'orders.quickActions.resolveIssue',
    'check',
    'success',
  );
  const issueIdx = actions.findIndex(a => a.key === 'issue');
  if (issueIdx === -1) {
    return [...actions, resolveRow];
  }
  return [
    ...actions.slice(0, issueIdx + 1),
    resolveRow,
    ...actions.slice(issueIdx + 1),
  ];
}

/** Đang đóng gói — 5 nút */
function packingActions(): QuickActionItem[] {
  return [
    row('payment', 'orders.quickActions.viewPayment', 'card', 'neutral'),
    row('issue', 'orders.quickActions.markIssue', 'warning', 'warning'),
    row(
      'cancel_packing',
      'orders.quickActions.cancelPacking',
      'package',
      'warning',
    ),
    row('cancel_order', 'orders.quickActions.cancelOrder', 'close', 'danger'),
  ];
}

/** Đã hủy / Đang giao / Đã giao — 3 nút */
function briefActions(): QuickActionItem[] {
  return [
    row('payment', 'orders.quickActions.viewPayment', 'card', 'neutral'),
    row('issue', 'orders.quickActions.markIssue', 'warning', 'warning'),
  ];
}

/** Chờ xác nhận — 5 nút */
function pendingActions(): QuickActionItem[] {
  return [
    row('payment', 'orders.quickActions.viewPayment', 'card', 'neutral'),
    row('confirm', 'orders.quickActions.confirmOrder', 'check', 'success'),
    row('issue', 'orders.quickActions.markIssue', 'warning', 'warning'),
    row('cancel_order', 'orders.quickActions.cancelOrder', 'close', 'danger'),
  ];
}

/** Sẵn sàng giao — 4 nút */
function readyToShipActions(): QuickActionItem[] {
  return [
    row('payment', 'orders.quickActions.viewPayment', 'card', 'neutral'),
    row('issue', 'orders.quickActions.markIssue', 'warning', 'warning'),
    row('cancel_order', 'orders.quickActions.cancelOrder', 'close', 'danger'),
  ];
}

/**
 * Nút thao tác nhanh theo `order.status` API.
 * Khi `hasOpenIssue` (vd. `order.has_issue === true`), thêm nút giải quyết vấn đề sau nút đánh dấu.
 * `confirmed` / `transferring`: gọn như trạng thái tương đương vận hành (3 nút).
 * `isPaid` quyết định nút đầu là "Xem thanh toán" (đã thanh toán) hay "Xem hóa đơn" (chưa thanh toán).
 */
export function getQuickActionsForOrderStatus(
  apiStatus: string,
  hasOpenIssue = false,
  isPaid = true,
): QuickActionItem[] {
  let base: QuickActionItem[];
  switch (apiStatus) {
    case 'packing':
      base = packingActions();
      break;
    case 'pending':
      base = pendingActions();
      break;
    case 'ready_to_ship':
      base = readyToShipActions();
      break;
    case 'cancelled':
    case 'shipped':
    case 'delivered':
      base = briefActions();
      break;
    case 'confirmed':
      base = readyToShipActions();
      break;
    case 'transferring':
      base = briefActions();
      break;
    default:
      base = briefActions();
  }
  return withResolveIssueAction(
    withPaymentOrInvoiceAction(base, isPaid),
    hasOpenIssue,
  );
}
