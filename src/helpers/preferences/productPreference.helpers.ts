import { preferenceKeys } from '@/src/configs/preferences/preferences.constants';
import {
  computePreferenceScore,
  sortPreferenceEntries,
} from '@/src/helpers/preferences/preferences.helpers';
import { filterSearchProducts, sortSearchProductsByStockPriority } from '@/src/helpers/search/search.helpers';
import type { DraftProductItem } from '@/src/types/createOrderDraft/createOrderDraft.types';
import type { PreferenceEntry, RecordPreferencePayload } from '@/src/types/preferences/preferences.types';
import type { SearchProduct } from '@/src/types/search/search.types';

function readMetaBoolean(value: string | undefined): boolean {
  return value === 'true';
}

function readMetaNumber(value: string | undefined): number | undefined {
  if (value == null || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function searchProductToPreferenceMeta(
  product: SearchProduct,
): Record<string, string> {
  const meta: Record<string, string> = {
    seller: product.sellerName || product.seller || '',
    description: product.description || '',
    priceCny: String(product.priceCny ?? 0),
    priceVnd: String(product.priceVnd ?? 0),
    isOutOfStock: String(product.isOutOfStock ?? false),
    isLowStock: String(product.isLowStock ?? false),
    isInStock: String(product.isInStock ?? false),
  };

  if (product.thumbnailUrl) {
    meta.thumbnailUrl = product.thumbnailUrl;
  }

  if (product.imageUrl) {
    meta.imageUrl = product.imageUrl;
  }

  if (product.sku) {
    meta.sku = product.sku;
  }

  if (product.sellerName) {
    meta.sellerName = product.sellerName;
  }

  if (product.availableStock != null) {
    meta.availableStock = String(product.availableStock);
  }

  return meta;
}

export function preferenceEntryToSearchProduct(
  entry: PreferenceEntry,
): SearchProduct | null {
  if (!entry.id || !entry.label.trim()) {
    return null;
  }

  const meta = entry.meta ?? {};

  return {
    id: entry.id,
    name: entry.label,
    priceCny: readMetaNumber(meta.priceCny) ?? 0,
    priceVnd: readMetaNumber(meta.priceVnd),
    description: meta.description ?? '',
    seller: meta.seller ?? meta.sellerName ?? '',
    rating: 0,
    soldCount: 0,
    thumbnailUrl: meta.thumbnailUrl ?? null,
    imageUrl: meta.imageUrl ?? meta.thumbnailUrl ?? null,
    sku: meta.sku,
    availableStock: readMetaNumber(meta.availableStock),
    isOutOfStock: readMetaBoolean(meta.isOutOfStock),
    isLowStock: readMetaBoolean(meta.isLowStock),
    isInStock: readMetaBoolean(meta.isInStock),
    sellerName: meta.sellerName ?? meta.seller,
  };
}

export function buildSearchProductPreferenceRecord(
  product: SearchProduct,
  boost = 1,
): RecordPreferencePayload {
  return {
    key: preferenceKeys.product,
    id: product.id,
    label: product.name,
    subtitle: product.sku ? `SKU: ${product.sku}` : product.sellerName || product.seller,
    meta: searchProductToPreferenceMeta(product),
    boost,
  };
}

export function buildDraftProductPreferenceRecord(
  product: DraftProductItem,
  boost = 2,
): RecordPreferencePayload {
  return {
    key: preferenceKeys.product,
    id: product.id,
    label: product.name,
    subtitle: product.sku ? `SKU: ${product.sku}` : product.variant,
    meta: {
      seller: product.variant,
      description: product.variant,
      priceCny: String(product.priceCny ?? 0),
      priceVnd: String(product.priceVnd ?? 0),
      isOutOfStock: String(product.isOutOfStock ?? false),
      ...(product.thumbnailUrl ? { thumbnailUrl: product.thumbnailUrl } : {}),
      ...(product.sku ? { sku: product.sku } : {}),
      ...(product.maxStock != null ? { availableStock: String(product.maxStock) } : {}),
    },
    boost,
  };
}

export function buildDraftProductPreferenceRecords(
  products: DraftProductItem[],
  boost = 2,
): RecordPreferencePayload[] {
  return products.map(product => buildDraftProductPreferenceRecord(product, boost));
}

export function mergeSearchProductsWithPreferences(
  products: SearchProduct[],
  query: string,
  productPreferences: PreferenceEntry[],
): SearchProduct[] {
  const loadedIds = new Set(products.map(product => product.id));
  const filtered = filterSearchProducts(products, query);
  const now = Date.now();
  const preferenceScores = new Map(
    productPreferences.map(entry => [
      entry.id,
      computePreferenceScore(entry, now),
    ]),
  );

  const preferredOnly: SearchProduct[] = [];
  for (const entry of sortPreferenceEntries(productPreferences)) {
    if (loadedIds.has(entry.id)) {
      continue;
    }

    const product = preferenceEntryToSearchProduct(entry);
    if (product == null) {
      continue;
    }

    if (filterSearchProducts([product], query).length === 0) {
      continue;
    }

    preferredOnly.push(product);
  }

  return sortSearchProductsByStockPriority(
    [...preferredOnly, ...filtered],
    preferenceScores,
  );
}
