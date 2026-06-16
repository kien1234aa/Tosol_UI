import type { InventorySummaryItemApi } from '@services/warehouse/inventoryApiTypes';
import type { InventoryListItemApi } from '@services/warehouse/inventoryItemsApiTypes';
import type { InventoryLineRow, InventoryRow } from '@features/goods/myInventory/myInventoryTypes';

export function formatProductUnit(
  unit: string | null | undefined,
): string | null {
  const u = (unit ?? '').toLowerCase().trim();
  if (u === 'piece' || u === 'pcs' || u === 'cái' || u === 'cai') {
    return 'Cái';
  }
  if (u === 'box' || u === 'hop' || u === 'hộp') {
    return 'Hộp';
  }
  if (u === 'bottle' || u === 'chai') {
    return 'Chai';
  }
  const raw = (unit ?? '').trim();
  return raw.length > 0 ? raw : null;
}

/** Nối các phần meta — bỏ qua giá trị rỗng. */
export function joinInventoryMetaLine(
  parts: (string | null | undefined)[],
): string | null {
  const filtered = parts
    .map(p => (p ?? '').trim())
    .filter(p => p.length > 0);
  return filtered.length > 0 ? filtered.join(' · ') : null;
}

export function inventorySummaryToRow(
  item: InventorySummaryItemApi,
): InventoryRow {
  const p = item.product;
  return {
    id: item.product_id,
    name: p.name?.trim() || '—',
    sku: p.sku?.trim() || null,
    unit: formatProductUnit(p.unit),
    onHand: item.total_quantity,
    reserved: item.total_reserved,
    available: item.total_available,
    imageUrl: p.thumbnail_url ?? p.image_url ?? null,
    minStock: p.min_stock,
  };
}

function locationLabelFromInclude(
  loc: InventoryListItemApi['location'],
): string | null {
  if (loc == null) {
    return null;
  }
  const name = typeof loc.name === 'string' ? loc.name.trim() : '';
  const code = typeof loc.code === 'string' ? loc.code.trim() : '';
  if (name && code) {
    return `${name} (${code})`;
  }
  return name || code || null;
}

export function inventoryListItemToLineRow(
  item: InventoryListItemApi,
): InventoryLineRow {
  const p = item.product;
  const minStock =
    p.min_stock != null && Number.isFinite(Number(p.min_stock))
      ? Number(p.min_stock)
      : null;
  const warehouseName =
    item.warehouse?.name?.trim() ||
    (item.warehouse_id != null ? `Kho #${item.warehouse_id}` : null);
  return {
    inventoryId: item.id,
    productId: item.product_id,
    name: p.name?.trim() || '—',
    sku: p.sku?.trim() || null,
    unitLabel: formatProductUnit(item.unit ?? p.unit),
    quantity: item.quantity,
    reserved: item.reserved_quantity,
    available: item.available_quantity,
    imageUrl: (p.thumbnail_url ?? p.image_url ?? '').trim() || null,
    warehouseName,
    locationLabel: locationLabelFromInclude(item.location),
    condition: (item.condition ?? 'good').trim(),
    expiryDate: item.expiry_date,
    isExpired: item.is_expired === true,
    productIsLowStock: p.is_low_stock === true,
    productIsOutOfStock: p.is_out_of_stock === true,
    minStock,
  };
}
