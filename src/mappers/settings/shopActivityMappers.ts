import i18n from '@shared/i18n';
import type { ActivityLogApi } from '@services/activity/activityApiTypes';
import { formatOrderDateLocale } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import { platformDisplayLabel } from '@features/settings/shops/shopDirectoryLabels';

export type ShopActivityRow = {
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
      `shops.detail.activityDescriptions.${activityTextKey(text)}`,
      { defaultValue: '' },
    );
    if (translated) {
      return translated;
    }
  }
  return (
    description.trim() ||
    event?.trim() ||
    i18n.t('shops.detail.activityFallback')
  );
}

function formatActivityProperties(
  props: Record<string, unknown> | null | undefined,
): string | null {
  if (!props) {
    return null;
  }
  const parts: string[] = [];
  const name = props.name;
  if (typeof name === 'string' && name.trim()) {
    parts.push(
      i18n.t('shops.detail.activityShopName', {
        name: name.trim(),
      }),
    );
  }
  const platform = props.platform;
  if (typeof platform === 'string' && platform.trim()) {
    parts.push(
      i18n.t('shops.detail.activityPlatform', {
        platform: platformDisplayLabel(platform),
      }),
    );
  }
  const platformShopId = props.platform_shop_id ?? props.platformShopId;
  if (typeof platformShopId === 'string' && platformShopId.trim()) {
    parts.push(
      i18n.t('shops.detail.activityPlatformShopId', {
        id: platformShopId.trim(),
      }),
    );
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function shopActivityToRow(item: ActivityLogApi): ShopActivityRow {
  return {
    id: item.id,
    title: mapActivityDescription(item.description, item.event),
    actorName: item.causer?.name?.trim() || null,
    detailLine: formatActivityProperties(item.properties),
    createdAtDisplay: formatOrderDateLocale(item.created_at),
  };
}
