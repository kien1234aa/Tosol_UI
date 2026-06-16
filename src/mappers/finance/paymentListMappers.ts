import {
  formatDateVi,
  paymentMethodLabel,
} from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type {
  PaymentListItemApi,
  PaymentListSaleOrderApi,
} from '@services/finance/paymentApiTypes';
import type { GetPaymentsParams } from '@services/finance/paymentAPI';
import type {
  PaymentListFilter,
  PaymentListKindFilter,
  PaymentListMethodFilter,
  PaymentListRow,
  PaymentListRowKind,
  PaymentListRowStatus,
} from '@features/finance/payment/paymentListTypes';

const VND_SYMBOL = 'đ';

export function paymentListFilterToApiStatus(
  f: PaymentListFilter,
): string | undefined {
  if (f === 'all') {
    return undefined;
  }
  return f;
}

/** Giá trị gửi `filter[payment_method]` — khớp API TOSOL / Laravel. */
export function paymentMethodFilterToApiSlug(
  m: PaymentListMethodFilter,
): string | undefined {
  if (m === 'all') {
    return undefined;
  }
  return m;
}

/** Giá trị gửi `filter[type]` — thanh toán / hoàn tiền. */
export function paymentKindFilterToApiSlug(
  k: PaymentListKindFilter,
): string | undefined {
  if (k === 'all') {
    return undefined;
  }
  return k;
}

/** Tham số phụ kèm mọi lần gọi `GET /payments` (method + loại). */
export function paymentListSideFiltersForApi(
  method: PaymentListMethodFilter,
  kind: PaymentListKindFilter,
): { filterPaymentMethod?: string; filterPaymentType?: string } {
  const out: { filterPaymentMethod?: string; filterPaymentType?: string } = {};
  const m = paymentMethodFilterToApiSlug(method);
  if (m) {
    out.filterPaymentMethod = m;
  }
  const k = paymentKindFilterToApiSlug(kind);
  if (k) {
    out.filterPaymentType = k;
  }
  return out;
}

/** Ngày / số tiền — gửi kèm GET `/payments` khi có giá trị hợp lệ. */
export function paymentListRangeFiltersForApi(
  dateFrom: string,
  dateTo: string,
  amountFrom: string,
  amountTo: string,
): Pick<
  GetPaymentsParams,
  'filterDateFrom' | 'filterDateTo' | 'filterAmountFrom' | 'filterAmountTo'
> {
  const out: Pick<
    GetPaymentsParams,
    'filterDateFrom' | 'filterDateTo' | 'filterAmountFrom' | 'filterAmountTo'
  > = {};
  const df = dateFrom?.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(df ?? '')) {
    out.filterDateFrom = df;
  }
  const dt = dateTo?.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dt ?? '')) {
    out.filterDateTo = dt;
  }
  const rawMin = amountFrom?.replace(/\D/g, '') ?? '';
  const nMin = rawMin === '' ? NaN : Number(rawMin);
  if (Number.isFinite(nMin) && nMin >= 0) {
    out.filterAmountFrom = String(Math.round(nMin));
  }
  const rawMax = amountTo?.replace(/\D/g, '') ?? '';
  const nMax = rawMax === '' ? NaN : Number(rawMax);
  if (Number.isFinite(nMax) && nMax >= 0) {
    out.filterAmountTo = String(Math.round(nMax));
  }
  return out;
}

export function parsePaymentAmount(
  raw: number | string | undefined | null,
): number {
  if (raw == null) {
    return NaN;
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : NaN;
  }
  const n = Number(String(raw).replace(/,/g, '').replace(/\s/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export function paymentCurrencySymbol(
  p: PaymentListItemApi,
  so?: PaymentListSaleOrderApi | null,
): string {
  const order = so ?? pickSaleOrder(p);
  return (
    order?.currency?.symbol?.trim() ||
    p.currency?.symbol?.trim() ||
    VND_SYMBOL
  );
}

function fmtPaymentAmountOrNull(
  raw: number | string | undefined | null,
  symbol: string,
): string | null {
  const amt = parsePaymentAmount(raw);
  if (!Number.isFinite(amt)) {
    return null;
  }
  return `${Math.round(amt).toLocaleString('vi-VN')}${symbol}`;
}

export function apiPaymentListStatusToRowStatus(
  api: string,
): PaymentListRowStatus {
  const t = api.trim().toLowerCase();
  if (t === 'pending' || t === 'processing' || t === 'awaiting_payment') {
    return 'pending';
  }
  if (
    t === 'completed' ||
    t === 'paid' ||
    t === 'success' ||
    t === 'succeeded'
  ) {
    return 'completed';
  }
  if (t === 'failed' || t === 'failure') {
    return 'failed';
  }
  if (t === 'cancelled' || t === 'canceled') {
    return 'cancelled';
  }
  return 'unknown';
}

export function paymentRowStatusLabel(s: PaymentListRowStatus): string {
  switch (s) {
    case 'pending':
      return 'Chờ thanh toán';
    case 'completed':
      return 'Hoàn thành';
    case 'failed':
      return 'Thất bại';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Khác';
  }
}

export function pickSaleOrder(
  p: PaymentListItemApi,
): PaymentListSaleOrderApi | null | undefined {
  return p.sale_order ?? p.saleOrder ?? p.order ?? null;
}

function customerDisplay(p: PaymentListItemApi): string | null {
  const so = pickSaleOrder(p);
  const c = p.customer ?? so?.customer;
  return (
    c?.name?.trim() ||
    c?.full_name?.trim() ||
    so?.buyer_name?.trim() ||
    null
  );
}

/** Tham chiếu thanh toán (không dùng id số làm nhãn hiển thị). */
function paymentReferenceLabel(p: PaymentListItemApi): string {
  return (
    p.reference_number?.trim() ||
    p.gateway_transaction_id?.trim() ||
    p.reference?.trim() ||
    p.payment_number?.trim() ||
    p.transaction_id?.trim() ||
    p.uuid?.trim() ||
    `#${p.id}`
  );
}

function kindFromApi(p: PaymentListItemApi): PaymentListRowKind {
  const raw = (p.type ?? p.payment_type ?? '').trim().toLowerCase();
  if (raw === 'refund' || raw === 'hoan_tien' || raw.includes('refund')) {
    return 'refund';
  }
  if (!raw || raw === 'payment' || raw === 'thanh_toan') {
    return 'payment';
  }
  return 'unknown';
}

function typeLabel(kind: PaymentListRowKind): string {
  switch (kind) {
    case 'refund':
      return 'Hoàn tiền';
    case 'payment':
      return 'Thanh toán';
    default:
      return 'Khác';
  }
}

function methodTone(
  method: string | null | undefined,
): PaymentListRow['methodTone'] {
  const t = (method ?? '').trim().toLowerCase();
  if (t === 'bank_transfer' || t === 'transfer') {
    return 'bank';
  }
  if (t === 'cod') {
    return 'cod';
  }
  if (t === 'cash') {
    return 'cash';
  }
  return 'muted';
}

/** Nối meta card — bỏ qua giá trị rỗng. */
export function joinPaymentMetaLine(
  parts: (string | null | undefined)[],
): string | null {
  const filtered = parts
    .map(p => (p ?? '').trim())
    .filter(p => p.length > 0);
  return filtered.length > 0 ? filtered.join(' · ') : null;
}

export function paymentListItemToRow(p: PaymentListItemApi): PaymentListRow {
  const so = pickSaleOrder(p);
  const sym = paymentCurrencySymbol(p, so);
  const amountDisplay = fmtPaymentAmountOrNull(p.amount, sym);
  const status = apiPaymentListStatusToRowStatus(p.status);
  const kind = kindFromApi(p);
  const dateSrc = p.paid_at ?? p.created_at ?? null;
  const paidDateLabel = formatDateVi(dateSrc);
  const paidDateDisplay =
    paidDateLabel !== '—' ? paidDateLabel : null;

  const uuid = p.uuid?.trim();
  return {
    id: String(p.id),
    detailRef: uuid || String(p.id),
    paymentCode: paymentReferenceLabel(p),
    orderRef: so?.order_number?.trim() || null,
    customerName: customerDisplay(p),
    amountDisplay,
    methodRaw: p.payment_method ?? null,
    methodLabel: paymentMethodLabel(p.payment_method),
    methodTone: methodTone(p.payment_method),
    paidDateLabel: paidDateDisplay,
    status,
    statusLabel: paymentRowStatusLabel(status),
    kind,
    typeLabel: typeLabel(kind),
  };
}
