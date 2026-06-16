import { formatOrderDateVi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type {
  SettlementApi,
  SettlementItemApi,
} from '@services/finance/settlementApiTypes';
import type {
  SettlementListFilter,
  SettlementListRow,
  SettlementNetDirection,
  SettlementRowStatus,
} from '@features/finance/settlement/settlementListTypes';

const VND_SYMBOL = 'đ';

/** Map bộ lọc UI → `filter[status]` API. */
export function settlementListFilterToApiStatus(
  f: SettlementListFilter,
): string | undefined {
  if (f === 'all') {
    return undefined;
  }
  return f;
}

export function settlementToNum(
  v: number | string | null | undefined,
): number {
  if (v == null) {
    return NaN;
  }
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : NaN;
  }
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

export function apiSettlementStatusToRowStatus(
  api: string,
): SettlementRowStatus {
  const s = (api ?? '').trim().toLowerCase();
  if (s === 'draft' || s === 'confirmed' || s === 'settled') {
    return s;
  }
  if (s === 'cancelled' || s.includes('cancel')) {
    return 'cancelled';
  }
  return 'draft';
}

export function settlementRowStatusLabel(s: SettlementRowStatus): string {
  switch (s) {
    case 'draft':
      return 'Nháp';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'settled':
      return 'Đã quyết toán';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return s;
  }
}

export function settlementCurrencySymbol(
  line: SettlementItemApi | null | undefined,
): string {
  const sym = line?.currency?.symbol?.trim();
  return sym || VND_SYMBOL;
}

function fmtMoneyOrNull(
  v: number | string | null | undefined,
  symbol: string,
): string | null {
  const n = settlementToNum(v);
  if (!Number.isFinite(n)) {
    return null;
  }
  return `${Math.round(n).toLocaleString('vi-VN')}${symbol}`;
}

export function mapSettlementPaymentDirection(raw: string | undefined | null): {
  dir: SettlementNetDirection;
  label: string;
} {
  const r = (raw ?? '').trim().toLowerCase();
  if (r === 'tosol_to_seller' || r === 'tosol_pays_seller') {
    return { dir: 'tosol_pays_seller', label: 'TOSOL trả Seller' };
  }
  if (r === 'seller_to_tosol' || r === 'seller_pays_tosol') {
    return { dir: 'seller_pays_tosol', label: 'Seller trả TOSOL' };
  }
  return { dir: 'seller_pays_tosol', label: 'Seller trả TOSOL' };
}

export function settlementPrimaryLineItem(
  s: SettlementApi,
): SettlementItemApi | null {
  const list = s.items ?? [];
  return list[0] ?? null;
}

/** Nối meta card — bỏ qua giá trị rỗng. */
export function joinSettlementMetaLine(
  parts: (string | null | undefined)[],
): string | null {
  const filtered = parts
    .map(p => (p ?? '').trim())
    .filter(p => p.length > 0);
  return filtered.length > 0 ? filtered.join(' · ') : null;
}

export function settlementApiToListRow(s: SettlementApi): SettlementListRow {
  const line = settlementPrimaryLineItem(s);
  const sym = settlementCurrencySymbol(line);
  const cod = line != null ? fmtMoneyOrNull(line.cod_collected, sym) : null;
  const fee =
    line != null
      ? fmtMoneyOrNull(Math.abs(settlementToNum(line.total_payable)), sym)
      : null;
  const net = line != null ? fmtMoneyOrNull(line.net_amount, sym) : null;
  const { dir, label: dirLabel } = mapSettlementPaymentDirection(
    line?.payment_direction,
  );
  const rowStatus = apiSettlementStatusToRowStatus(s.status);
  const seller = s.seller;
  const sellerCode = seller?.code?.trim() || seller?.legacy_id?.trim() || null;
  const periodFrom = formatOrderDateVi(s.period_from);
  const periodTo = formatOrderDateVi(s.period_to);
  const periodLabel =
    periodFrom !== '—' && periodTo !== '—'
      ? `${periodFrom} – ${periodTo}`
      : periodFrom !== '—'
        ? periodFrom
        : periodTo !== '—'
          ? periodTo
          : null;

  return {
    id: String(s.id),
    settlementNumber: s.settlement_number,
    sellerName: seller?.name?.trim() || null,
    sellerCode,
    periodLabel,
    codCollectedDisplay: cod,
    totalFeeDisplay: fee,
    netAmountDisplay: net,
    netDirection: dir,
    netDirectionLabel: dirLabel,
    status: rowStatus,
    statusLabel: settlementRowStatusLabel(rowStatus),
  };
}
