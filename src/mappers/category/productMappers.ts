import type { ProductApi } from '@services/category/productApiTypes';
import type { ProductListRow } from '@features/category/products/productListTypes';

function formatPriceVnd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) {
    return '0';
  }
  return `${Math.round(n).toLocaleString('vi-VN')}\u0111`;
}

export function productApiToListRow(p: ProductApi): ProductListRow {
  const total = Math.round(
    Number.parseFloat(String(p.total_stock ?? '0')) || 0,
  );
  const reserved = Math.round(
    Number.parseFloat(String(p.reserved_stock ?? '0')) || 0,
  );
  const priceNum = Number.parseFloat(String(p.price)) || 0;

  return {
    id: p.id,
    key: `p-${p.id}`,
    sku: p.sku,
    name: p.name,
    priceDisplay: formatPriceVnd(priceNum),
    totalStock: total,
    reserved,
    warehouseCount: p.warehouses_count ?? 0,
    status: p.is_active ? 'active' : 'inactive',
    thumbUrl: p.thumbnail_url ?? p.image_url,
  };
}