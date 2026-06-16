import { formatMoneyFromApi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { ProductPriceApi } from '@services/category/productPriceApiTypes';
import type { ProductPriceByPriceListRow } from '@features/category/products/productDetail/productPriceByPriceListTypes';
import type { ProductPriceListRow } from '@features/category/priceList/priceListDetail/productPriceListTypes';

export function parseMinQuantityLabel(
  v: number | string | null | undefined,
): string | null {
  if (v == null || v === '') {
    return null;
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  if (Number.isInteger(n)) {
    return `Từ ${n.toLocaleString('vi-VN')} sp`;
  }
  return `Từ ${n.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} sp`;
}

export function formatProductPriceDisplay(
  price: string | number | null | undefined,
  decimalPlaces: number,
  currencySymbol?: string | null,
): string | null {
  if (price == null || String(price).trim() === '') {
    return null;
  }
  const sym = currencySymbol?.trim();
  if (sym) {
    const n = Number(price);
    if (!Number.isFinite(n)) {
      return String(price);
    }
    const rounded = decimalPlaces <= 0 ? Math.round(n) : n;
    const formatted = rounded.toLocaleString('vi-VN', {
      minimumFractionDigits: decimalPlaces > 0 ? decimalPlaces : 0,
      maximumFractionDigits: decimalPlaces > 0 ? decimalPlaces : 0,
    });
    return `${formatted}${sym}`;
  }
  const fallback = formatMoneyFromApi(String(price), decimalPlaces);
  return fallback !== '—' ? fallback : null;
}

export function productPriceToListRow(
  row: ProductPriceApi,
  decimalPlaces: number,
  currencySymbol?: string | null,
): ProductPriceListRow {
  const prod = row.product;
  const priceDisplay = formatProductPriceDisplay(
    row.price,
    decimalPlaces,
    currencySymbol,
  );

  return {
    key: String(row.id),
    productPriceId: row.id,
    productId: row.product_id,
    productSku: prod?.sku?.trim() || null,
    productName: prod?.name?.trim() || null,
    thumbUrl:
      prod?.thumbnail_url?.trim() || prod?.image_url?.trim() || null,
    priceDisplay,
    minQuantityLabel: parseMinQuantityLabel(row.min_quantity),
    isActive: row.is_active !== false,
  };
}

export function productPriceToByPriceListRow(
  row: ProductPriceApi,
): ProductPriceByPriceListRow {
  const pl = row.price_list;
  const currency = pl?.currency;
  const decimalPlaces = currency?.decimal_places ?? 0;
  const priceDisplay = formatProductPriceDisplay(
    row.price,
    decimalPlaces,
    currency?.symbol ?? null,
  );
  const code = pl?.code?.trim() || null;
  const name = pl?.name?.trim() || null;

  return {
    key: String(row.id),
    productPriceId: row.id,
    priceListId: pl?.id ?? row.price_list_id,
    priceListName: name,
    priceListCode: code,
    isDefaultPriceList: pl?.is_default === true,
    priceListActive: pl?.is_active !== false,
    currencyCode: currency?.code?.trim() || null,
    priceDisplay,
    minQuantityLabel: parseMinQuantityLabel(row.min_quantity),
    isActive: row.is_active !== false,
  };
}

export function sortProductPricesByPriceList(
  rows: ProductPriceByPriceListRow[],
): ProductPriceByPriceListRow[] {
  return [...rows].sort((a, b) => {
    if (a.isDefaultPriceList !== b.isDefaultPriceList) {
      return a.isDefaultPriceList ? -1 : 1;
    }
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    const aName = a.priceListName ?? a.priceListCode ?? '';
    const bName = b.priceListName ?? b.priceListCode ?? '';
    return aName.localeCompare(bName, 'vi');
  });
}
