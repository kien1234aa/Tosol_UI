import i18n from '@shared/i18n';
import {
  formatOrderDateLocale,
  resolveAppNumberLocale,
} from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { InvoiceApi } from '@services/finance/invoiceApiTypes';
import type {
  InvoiceListFilter,
  InvoiceListRow,
  InvoiceRowStatus,
} from '@features/finance/bill/invoiceListTypes';

/** Map bá»™ lá»c UI â†’ giĂ¡ trá»‹ `filter[status]` trĂªn API. */
export function invoiceListFilterToApiStatus(
  f: InvoiceListFilter,
): string | undefined {
  if (f === 'all') {
    return undefined;
  }
  if (f === 'partial') {
    return 'partially_paid';
  }
  return f;
}

export function apiInvoiceStatusToRowStatus(api: string): InvoiceRowStatus {
  if (api === 'partially_paid') {
    return 'partial';
  }
  if (
    api === 'pending' ||
    api === 'paid' ||
    api === 'overdue' ||
    api === 'draft' ||
    api === 'cancelled'
  ) {
    return api;
  }
  return 'pending';
}

export function invoiceRowStatusLabel(s: InvoiceRowStatus): string {
  return i18n.t(`financeInvoice.rowStatus.${s}`, { defaultValue: s });
}

function formatTotalsDisplay(totals: InvoiceApi['totals']): string {
  const list = totals ?? [];
  const dash = i18n.t('common.dash');
  if (list.length === 0) {
    return dash;
  }
  const loc = resolveAppNumberLocale();
  return list
    .map(t => {
      const n = Number(t.total_amount);
      if (!Number.isFinite(n)) {
        return dash;
      }
      const sym = t.currency?.symbol ?? '\u0111';
      return `${Math.round(n).toLocaleString(loc)}${sym}`;
    })
    .join(' Â· ');
}

function periodLabel(
  from: string | null | undefined,
  to: string | null | undefined,
): string {
  const dash = i18n.t('common.dash');
  const a = formatOrderDateLocale(from ?? null);
  const b = formatOrderDateLocale(to ?? null);
  if (a === dash && b === dash) {
    return dash;
  }
  return `${a} - ${b}`;
}

export function invoiceApiToListRow(inv: InvoiceApi): InvoiceListRow {
  const rowStatus = apiInvoiceStatusToRowStatus(inv.status);
  const seller = inv.seller;
  const sellerCode = seller?.code?.trim() || seller?.legacy_id?.trim() || 'â€”';

  return {
    id: String(inv.id),
    invoiceNumber: inv.invoice_number,
    sellerName: seller?.name?.trim() || 'â€”',
    sellerCode,
    periodLabel: periodLabel(inv.billing_period_from, inv.billing_period_to),
    totalDisplay: formatTotalsDisplay(inv.totals),
    status: rowStatus,
    statusLabel: invoiceRowStatusLabel(rowStatus),
    createdAtLabel: formatOrderDateLocale(inv.created_at),
  };
}