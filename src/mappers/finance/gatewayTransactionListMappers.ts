import { formatDateVi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { PaymentListSaleOrderApi } from '@services/finance/paymentApiTypes';
import { pickSaleOrder } from '@mappers/finance/paymentListMappers';
import type { GetGatewayTransactionsListParams } from '@services/finance/gatewayTransactionAPI';
import type { PaymentGatewayTransactionListItemApi } from '@services/finance/gatewayTransactionApiTypes';
import type {
  GatewayTxnListFilter,
  GatewayTxnListRow,
  GatewayTxnListTypeFilter,
  GatewayTxnRowStatus,
} from '@features/finance/gatewayTransaction/gatewayTransactionListTypes';

export function gatewayTxnListFilterToApiStatus(
  f: GatewayTxnListFilter,
): string | undefined {
  if (f === 'all') {
    return undefined;
  }
  return f;
}

export function gatewayTxnListExtraFiltersForApi(input: {
  sellerId: string;
  typeFilter: GatewayTxnListTypeFilter;
  dateFrom: string;
  dateTo: string;
}): Pick<
  GetGatewayTransactionsListParams,
  'filterSellerId' | 'filterType' | 'filterDateFrom' | 'filterDateTo'
> {
  const out: Pick<
    GetGatewayTransactionsListParams,
    'filterSellerId' | 'filterType' | 'filterDateFrom' | 'filterDateTo'
  > = {};
  const sid = input.sellerId?.trim() ?? '';
  const n = Number(sid);
  if (Number.isFinite(n) && n > 0) {
    out.filterSellerId = n;
  }
  if (input.typeFilter === 'payment' || input.typeFilter === 'refund') {
    out.filterType = input.typeFilter;
  }
  const df = input.dateFrom?.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(df ?? '')) {
    out.filterDateFrom = df;
  }
  const dt = input.dateTo?.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dt ?? '')) {
    out.filterDateTo = dt;
  }
  return out;
}

export function apiGatewayTxnStatusToRowStatus(
  api: string,
): GatewayTxnRowStatus {
  const t = api.trim().toLowerCase();
  if (t === 'pending' || t === 'awaiting_payment') {
    return 'pending';
  }
  if (t === 'processing' || t === 'in_progress' || t === 'in-progress') {
    return 'processing';
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
  return 'unknown';
}

export function gatewayTxnStatusLabel(s: GatewayTxnRowStatus): string {
  switch (s) {
    case 'pending':
      return 'Chá» thanh toĂ¡n';
    case 'processing':
      return 'Äang xá»­ lĂ½';
    case 'completed':
      return 'HoĂ n thĂ nh';
    case 'failed':
      return 'Tháº¥t báº¡i';
    default:
      return 'KhĂ¡c';
  }
}

function parseAmount(raw: number | string | undefined | null): number {
  if (raw == null) {
    return NaN;
  }
  if (typeof raw === 'number') {
    return raw;
  }
  const n = Number(String(raw).replace(/,/g, '').replace(/\s/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

function typeLabel(type: string | null | undefined): string {
  const t = (type ?? '').trim().toLowerCase();
  if (t === 'refund' || t.includes('refund')) {
    return 'HoĂ n tiá»n';
  }
  if (!t || t === 'payment') {
    return 'Thanh toĂ¡n';
  }
  return type?.trim() || 'â€”';
}

function pickTxnSaleOrder(
  item: PaymentGatewayTransactionListItemApi,
): PaymentListSaleOrderApi | null | undefined {
  return item.sale_order ?? item.saleOrder ?? null;
}

export function gatewayTxnListItemToRow(
  item: PaymentGatewayTransactionListItemApi,
): GatewayTxnListRow {
  const pay = item.payment ?? null;
  const soDirect = pickTxnSaleOrder(item);
  const soFromPay = pay ? pickSaleOrder(pay) : null;
  const so = soDirect ?? soFromPay;
  const sym = so?.currency?.symbol ?? pay?.currency?.symbol ?? '\u0111';
  const amt = parseAmount(item.amount ?? pay?.amount);
  const amountDisplay = Number.isFinite(amt)
    ? `${Math.round(amt).toLocaleString('vi-VN')}${sym}`
    : 'â€”';
  const status = apiGatewayTxnStatusToRowStatus(item.status);
  const seller = pay?.seller;
  const providerName =
    seller?.name?.trim() ||
    seller?.code?.trim() ||
    seller?.email?.trim() ||
    'â€”';

  const payUuid = pay?.uuid?.trim();
  const detailRef =
    payUuid ||
    (pay != null && pay.id != null ? String(pay.id) : '') ||
    item.uuid?.trim() ||
    String(item.id);

  return {
    id: String(item.id),
    detailRef,
    providerName,
    orderRef: so?.order_number?.trim() || 'â€”',
    amountDisplay,
    status,
    statusLabel: gatewayTxnStatusLabel(status),
    typeLabel: typeLabel(item.type ?? pay?.type),
    createdLabel: formatDateVi(item.created_at ?? pay?.created_at ?? null),
  };
}