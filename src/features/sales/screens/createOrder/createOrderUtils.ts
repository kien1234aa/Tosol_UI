import type { AddProductLinePayload } from '../../components/AddProductModal';

export type ShippingMode = 'seller' | 'warehouse' | 'pickup';

export type OrderLineRow = AddProductLinePayload & { key: string };

export type SelectOption<T> = { value: T; label: string; subtitle?: string };

export function computeLineTotal(l: OrderLineRow): number {
  const base = l.quantity * l.unitPrice;
  const afterDisc = base * (1 - l.discountPercent / 100);
  return Math.round(afterDisc * (1 + l.taxPercent / 100));
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatOrderDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function buildOrderDateChoices(spanDays: number): Date[] {
  const out: Date[] = [];
  const c = startOfDay(new Date()).getTime();
  const msPerDay = 86_400_000;
  for (let i = -spanDays; i <= spanDays; i++) {
    out.push(new Date(c + i * msPerDay));
  }
  return out;
}

/** So khớp tên địa danh (API khách ↔ Best Express), bỏ qua hoa thường / dấu / khoảng trắng thừa. */
export function normalizeLocationCompareKey(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function bestExpressRowByLabel<T extends { name: string }>(
  list: T[],
  targetRaw: string,
): T | undefined {
  const target = normalizeLocationCompareKey(targetRaw);
  if (!target) {
    return undefined;
  }
  const exact = list.find(
    r => normalizeLocationCompareKey(r.name) === target,
  );
  if (exact) {
    return exact;
  }
  return list.find(r => {
    const n = normalizeLocationCompareKey(r.name);
    return n.includes(target) || target.includes(n);
  });
}

/** Bỏ tỉnh/quận/phường ở cuối `full_address` (dạng "…, phường, quận, tỉnh") để chỉ còn đường/số nhà trong ô địa chỉ. */
export function stripTrailingLocationSegments(
  fullRaw: string,
  ward: string,
  district: string,
  province: string,
): string {
  const full = fullRaw.trim();
  if (!full) {
    return '';
  }
  const parts = full
    .split(',')
    .flatMap(s => { const t = s.trim(); return t ? [t] : []; });
  if (parts.length === 0) {
    return '';
  }
  const keysMatch = (segment: string, label: string) => {
    const ks = normalizeLocationCompareKey(segment);
    const kl = normalizeLocationCompareKey(label);
    if (!ks || !kl) {
      return false;
    }
    return ks === kl || ks.includes(kl) || kl.includes(ks);
  };
  const tryStrip = (label: string) => {
    const L = label.trim();
    if (!L || parts.length === 0) {
      return;
    }
    const last = parts[parts.length - 1];
    if (last && keysMatch(last, L)) {
      parts.pop();
    }
  };
  tryStrip(province);
  tryStrip(district);
  tryStrip(ward);
  return parts.join(', ');
}
