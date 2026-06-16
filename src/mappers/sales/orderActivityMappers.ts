import i18n from '@shared/i18n';
import type { ActivityLogApi } from '@services/activity/activityApiTypes';
import {
  formatOrderDateLocale,
  resolveAppNumberLocale,
} from '@features/sales/screens/orderDetail/orderDetailFormatters';

export type OrderActivityRow = {
  id: number;
  title: string;
  actorName: string | null;
  detailLine: string | null;
  createdAtDisplay: string;
};

function activityTextKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function mapActivityDescription(
  description: string,
  event: string | null,
): string {
  for (const raw of [description, event]) {
    const text = (raw ?? '').trim();
    if (!text) {
      continue;
    }
    const translated = i18n.t(
      `orders.detail.activityDescriptions.${activityTextKey(text)}`,
      { defaultValue: '' },
    );
    if (translated) {
      return translated;
    }
  }
  return (
    description.trim() ||
    event?.trim() ||
    i18n.t('orders.detail.activityFallback')
  );
}

function formatActivityAmount(total: unknown): string {
  const n = Number(total);
  const loc = resolveAppNumberLocale();
  if (Number.isFinite(n)) {
    const formatted = n.toLocaleString(loc);
    return loc === 'vi-VN' ? `${formatted}đ` : formatted;
  }
  return String(total);
}

function formatActivityProperties(
  props: Record<string, unknown> | null | undefined,
): string | null {
  if (!props) {
    return null;
  }
  const parts: string[] = [];
  const orderNumber = props.order_number;
  if (typeof orderNumber === 'string' && orderNumber.trim()) {
    parts.push(
      i18n.t('orders.detail.activityOrderCode', {
        code: orderNumber.trim(),
      }),
    );
  }
  const itemsCount = props.items_count;
  if (itemsCount != null && itemsCount !== '') {
    parts.push(
      i18n.t('orders.detail.activityItemsCount', {
        count: Number(itemsCount),
      }),
    );
  }
  const total = props.total;
  if (total != null && String(total).trim() !== '') {
    parts.push(
      i18n.t('orders.detail.activityTotal', {
        amount: formatActivityAmount(total),
      }),
    );
  }
  if (props.auto_confirmed === true) {
    parts.push(i18n.t('orders.detail.activityAutoConfirmed'));
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function orderActivityToRow(item: ActivityLogApi): OrderActivityRow {
  return {
    id: item.id,
    title: mapActivityDescription(item.description, item.event),
    actorName: item.causer?.name?.trim() || null,
    detailLine: formatActivityProperties(item.properties),
    createdAtDisplay: formatOrderDateLocale(item.created_at),
  };
}
