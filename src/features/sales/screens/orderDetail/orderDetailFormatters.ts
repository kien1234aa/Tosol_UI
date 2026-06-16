import i18n from '@shared/i18n';

export function formatMoneyFromApi(
  amountStr: string | null | undefined,
  decimalPlaces: number,
): string {
  if (amountStr == null || amountStr === '') {
    return '—';
  }
  const n = Number(amountStr);
  if (!Number.isFinite(n)) {
    return amountStr;
  }
  const rounded = decimalPlaces <= 0 ? Math.round(n) : n;
  return `${rounded.toLocaleString('vi-VN')}\u0111`;
}

export function formatMoneyVndNumber(n: number, decimalPlaces: number): string {
  if (!Number.isFinite(n)) {
    return '—';
  }
  const rounded = decimalPlaces <= 0 ? Math.round(n) : n;
  return `${rounded.toLocaleString('vi-VN')}\u0111`;
}

export function formatDateTimeVi(iso: string | null | undefined): string {
  if (iso == null || iso === '') {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateVi(iso: string | null | undefined): string {
  if (iso == null || iso === '') {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

export function resolveAppNumberLocale(): string {
  const raw = i18n.language || 'vi';
  const lng = raw.split('-')[0] || 'vi';
  if (lng === 'en') {
    return 'en-US';
  }
  if (lng === 'ja') {
    return 'ja-JP';
  }
  return 'vi-VN';
}

/** Date parts for billing periods / due dates — follows active app language. */
export function formatOrderDateLocale(s: string | null | undefined): string {
  if (s == null || s.trim() === '') {
    return i18n.t('common.dash');
  }
  const raw = s.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  const loc = resolveAppNumberLocale();
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(loc);
    }
  }
  const d2 = new Date(raw);
  if (Number.isNaN(d2.getTime())) {
    return raw;
  }
  return d2.toLocaleString(loc, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatOrderDateVi(s: string | null | undefined): string {
  if (s == null || s.trim() === '') {
    return '—';
  }
  const t = s.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN');
    }
  }
  return formatDateTimeVi(t);
}

export function shipPayerLabel(p: string | null | undefined): string {
  if (p == null || p === '') {
    return i18n.t('common.dash');
  }
  if (p === 'buyer') {
    return i18n.t('orders.shipPayer.buyer');
  }
  if (p === 'seller') {
    return i18n.t('orders.shipPayer.seller');
  }
  return p;
}

export function paymentMethodLabel(raw: string | null | undefined): string {
  const s = raw?.trim() ?? '';
  const k = s.toLowerCase();
  if (!k) {
    return i18n.t('common.dash');
  }
  if (k === 'cod') {
    return i18n.t('orders.paymentMethod.cod');
  }
  if (k === 'bank_transfer') {
    return i18n.t('orders.paymentMethod.bankTransfer');
  }
  return s;
}

export function orderStatusStepIndex(status: string): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'packing':
      return 2;
    case 'ready_to_ship':
      return 3;
    case 'shipped':
    case 'transferring':
    case 'pending_transfer':
    case 'transfer_failed':
      return 4;
    case 'delivered':
      return 5;
    case 'returned':
    case 'partially_returned':
    case 'partial_return':
    case 'fully_returned':
      return 5;
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

/** Khóa i18n `orders.progressStep.*` — theo thứ tự bước tiến độ đơn hàng. */
export const ORDER_DETAIL_PROGRESS_STEP_KEYS = [
  'orders.progressStep.created',
  'orders.progressStep.confirmed',
  'orders.progressStep.packing',
  'orders.progressStep.readyToShip',
  'orders.progressStep.shipped',
  'orders.progressStep.delivered',
] as const;
