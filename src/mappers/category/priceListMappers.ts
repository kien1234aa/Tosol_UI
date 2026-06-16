import type { PriceListApi } from '@services/category/priceListApiTypes';
import type { PriceListRow, PriceListRowStatus } from '@features/category/priceList/priceListTypes';

function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toLocaleDateString('vi-VN');
}

function buildValidityLabel(
  validFrom: string | null | undefined,
  validTo: string | null | undefined,
): string | null {
  const from = fmtDate(validFrom);
  const to = fmtDate(validTo);
  if (from && to) {
    return `${from} → ${to}`;
  }
  if (from) {
    return `Từ ${from}`;
  }
  if (to) {
    return `Đến ${to}`;
  }
  return null;
}

export function priceListApiToRow(p: PriceListApi): PriceListRow {
  const status: PriceListRowStatus = p.is_active ? 'active' : 'inactive';
  const validFromLabel = fmtDate(p.valid_from);
  const validToLabel = fmtDate(p.valid_to);
  return {
    id: p.id,
    key: `pl-${p.id}`,
    code: p.code,
    name: p.name,
    currencyCode: p.currency?.code ?? '—',
    isDefault: p.is_default,
    status,
    validFromLabel: validFromLabel ?? '—',
    validToLabel: validToLabel ?? '—',
    validityLabel: buildValidityLabel(p.valid_from, p.valid_to),
  };
}
