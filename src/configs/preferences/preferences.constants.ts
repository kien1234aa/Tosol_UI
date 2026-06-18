export const preferenceKeys = {
  shop: 'shop',
  packagingWarehouse: 'packagingWarehouse',
  searchWarehouse: 'searchWarehouse',
  customer: 'customer',
  shippingMethod: 'shippingMethod',
  shippingPartner: 'shippingPartner',
  product: 'product',
  searchQuery: 'searchQuery',
} as const;

export type PreferenceKey = (typeof preferenceKeys)[keyof typeof preferenceKeys];

/** Max entries kept per preference bucket. */
export const maxPreferenceEntries = 20;

/** Top N items shown as quick suggestions in pickers. */
export const preferenceSuggestionLimit = 3;

/** Minimum chars before recording a search query preference. */
export const searchQueryPreferenceMinLength = 2;

export const preferencesCopy = {
  recentSection: 'Gần đây',
  recentSearches: 'Tìm kiếm gần đây',
} as const;

export function buildPreferenceStorageKey(
  key: string,
  contextKey?: string,
): string {
  return contextKey ? `${key}::${contextKey}` : key;
}

export function buildShopContextKey(shopId: number): string {
  return `shop:${shopId}`;
}

export function buildWarehouseContextKey(warehouseId: number): string {
  return `warehouse:${warehouseId}`;
}

export function buildShippingMethodContextKey(
  method: string,
  warehouseId?: number | null,
): string {
  if (warehouseId != null) {
    return `method:${method}::warehouse:${warehouseId}`;
  }
  return `method:${method}`;
}
