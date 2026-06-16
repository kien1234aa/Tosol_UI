import i18n from '@shared/i18n';
import type { ActivityLogApi } from '@services/activity/activityApiTypes';
import { formatOrderDateLocale } from '@features/sales/screens/orderDetail/orderDetailFormatters';

export type ActivityRow = {
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

export type CreateActivityRowMapperOptions = {
  i18nPrefix: string;
  formatProperties?: (
    props: Record<string, unknown> | null | undefined,
  ) => string | null;
};

export function createActivityRowMapper({
  i18nPrefix,
  formatProperties,
}: CreateActivityRowMapperOptions): (item: ActivityLogApi) => ActivityRow {
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
        `${i18nPrefix}.activityDescriptions.${activityTextKey(text)}`,
        { defaultValue: '' },
      );
      if (translated) {
        return translated;
      }
    }
    return (
      description.trim() ||
      event?.trim() ||
      i18n.t(`${i18nPrefix}.activityFallback`)
    );
  }

  return (item: ActivityLogApi): ActivityRow => ({
    id: item.id,
    title: mapActivityDescription(item.description, item.event),
    actorName: item.causer?.name?.trim() || null,
    detailLine: formatProperties?.(item.properties) ?? null,
    createdAtDisplay: formatOrderDateLocale(item.created_at),
  });
}

export function formatNameProperty(
  i18nPrefix: string,
  props: Record<string, unknown> | null | undefined,
): string | null {
  if (!props) {
    return null;
  }
  const name = props.name;
  if (typeof name === 'string' && name.trim()) {
    return i18n.t(`${i18nPrefix}.activityName`, { name: name.trim() });
  }
  return null;
}

export function formatOrderNumberProperty(
  i18nPrefix: string,
  props: Record<string, unknown> | null | undefined,
): string | null {
  if (!props) {
    return null;
  }
  const orderNumber =
    props.order_number ?? props.orderNumber ?? props.reference;
  if (typeof orderNumber === 'string' && orderNumber.trim()) {
    return i18n.t(`${i18nPrefix}.activityOrderCode`, {
      code: orderNumber.trim(),
    });
  }
  return null;
}
