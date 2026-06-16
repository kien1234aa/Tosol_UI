import { formatDateTimeVi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { ProductShopMappingApi } from '@services/settings/productShopMappingApiTypes';
import type { ShopProductMappingListRow } from '@features/settings/shops/shopDetail/shopProductMappingTypes';

function syncStatusLabel(raw: string | null | undefined): string | null {
  const s = (raw ?? '').trim().toLowerCase();
  if (!s) {
    return null;
  }
  if (s === 'synced' || s === 'success' || s === 'completed') {
    return 'Đã đồng bộ';
  }
  if (s === 'pending' || s === 'waiting') {
    return 'Chờ đồng bộ';
  }
  if (s === 'failed' || s === 'error') {
    return 'Lỗi đồng bộ';
  }
  if (s === 'disabled' || s === 'inactive') {
    return 'Tắt';
  }
  return raw?.trim() ?? '';
}

function formatSyncedAt(iso: string | null | undefined): string | null {
  if (!iso?.trim()) {
    return null;
  }
  const formatted = formatDateTimeVi(iso);
  return formatted !== '—' ? formatted : null;
}

/** Nối meta card — bỏ qua giá trị rỗng. */
export function joinShopProductMappingMetaLine(
  parts: (string | null | undefined)[],
): string | null {
  const filtered = parts
    .map(p => (p ?? '').trim())
    .filter(p => p.length > 0);
  return filtered.length > 0 ? filtered.join(' · ') : null;
}

export function productShopMappingToListRow(
  m: ProductShopMappingApi,
): ShopProductMappingListRow {
  const prod = m.product;
  const platformProductId =
    m.platform_product_id?.trim() ||
    m.platform_item_id?.trim() ||
    m.external_id?.trim() ||
    null;
  const platformSku = m.platform_sku?.trim() || null;

  return {
    key: String(m.id),
    mappingId: m.id,
    productId: m.product_id,
    productSku: prod?.sku?.trim() || null,
    productName: prod?.name?.trim() || null,
    thumbUrl:
      prod?.thumbnail_url?.trim() || prod?.image_url?.trim() || null,
    platformProductId,
    platformSku,
    syncStatusLabel: syncStatusLabel(m.sync_status),
    lastSyncedDisplay: formatSyncedAt(m.last_synced_at),
  };
}
