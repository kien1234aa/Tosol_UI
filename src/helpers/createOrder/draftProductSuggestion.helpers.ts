import { draftCopy, draftQuantityLimits } from '@/src/configs/createOrder/draft.constants';
import { exchangeConfig } from '@/src/configs/search/search.constants';
import {
  getAddDraftMaxQuantity,
  validateAddDraftProduct,
} from '@/src/helpers/createOrder/draftProduct.helpers';
import {
  computePreferenceScore,
  sortPreferenceEntries,
} from '@/src/helpers/preferences/preferences.helpers';
import { preferenceEntryToSearchProduct } from '@/src/helpers/preferences/productPreference.helpers';
import { filterSearchProducts } from '@/src/helpers/search/search.helpers';
import type {
  AddDraftProductPayload,
  AddDraftProductResult,
  DraftProductGroup,
} from '@/src/types/createOrderDraft/createOrderDraft.types';
import type { PreferenceEntry } from '@/src/types/preferences/preferences.types';
import type { ProductSuggestionItem } from '@/src/types/products';
import type { SearchProduct } from '@/src/types/search/search.types';

export interface StagedDraftProduct {
  productId: string;
  suggestion: ProductSuggestionItem;
  quantity: number;
}

export interface DraftProductSuggestionListItem {
  suggestion: ProductSuggestionItem;
  isPreferred: boolean;
}

export function suggestionToSearchProduct(
  item: ProductSuggestionItem,
  sellerName: string,
): SearchProduct {
  return {
    id: String(item.id),
    name: item.name,
    priceCny: item.priceVnd > 0 ? item.priceVnd / exchangeConfig.cnyToVnd : 0,
    priceVnd: item.priceVnd,
    description: '',
    seller: sellerName,
    sellerName,
    rating: 0,
    soldCount: 0,
    thumbnailUrl: item.thumbnailUrl,
    imageUrl: item.thumbnailUrl,
    sku: item.sku,
    availableStock: item.availableStock,
    isOutOfStock: item.isOutOfStock,
    isLowStock: false,
    isInStock: !item.isOutOfStock,
  };
}

export function searchProductToSuggestionItem(
  product: SearchProduct,
): ProductSuggestionItem | null {
  const parsedId = Number.parseInt(product.id, 10);
  if (!Number.isFinite(parsedId)) {
    return null;
  }

  return {
    id: parsedId,
    sku: product.sku ?? '',
    name: product.name,
    unit: product.unit ?? 'piece',
    unitLabel: product.unit ?? 'piece',
    thumbnailUrl: product.thumbnailUrl ?? product.imageUrl ?? null,
    priceVnd: product.priceVnd ?? 0,
    availableStock: product.availableStock ?? 0,
    isOutOfStock: product.isOutOfStock ?? false,
  };
}

export function buildAddDraftProductPayloadFromSuggestion(
  item: ProductSuggestionItem,
  quantity: number,
  sellerName: string,
): AddDraftProductPayload {
  const availableStock = item.availableStock ?? 0;

  return {
    productId: String(item.id),
    name: item.name,
    seller: sellerName || draftCopy.defaultSupplier,
    priceCny: item.priceVnd > 0 ? item.priceVnd / exchangeConfig.cnyToVnd : 0,
    priceVnd: item.priceVnd ?? 0,
    thumbnailUrl: item.thumbnailUrl,
    sku: item.sku,
    maxStock:
      availableStock > 0
        ? Math.floor(availableStock)
        : draftQuantityLimits.max,
    isOutOfStock: item.isOutOfStock ?? false,
    quantity,
    variant: item.sku ? `SKU: ${item.sku}` : draftCopy.defaultVariant,
    isCustomPricing: (item.priceVnd ?? 0) <= 0,
  };
}

function simulateAddDraftProduct(
  groups: DraftProductGroup[],
  payload: AddDraftProductPayload,
): void {
  let group = groups.find(item => item.supplierName === payload.seller);

  if (!group) {
    group = {
      id: `sim-${payload.seller}`,
      supplierName: payload.seller,
      insurance: false,
      woodPacking: false,
      note: '',
      products: [],
    };
    groups.push(group);
  }

  const maxQuantity = getAddDraftMaxQuantity(payload);
  const existingProduct = group.products.find(item => item.id === payload.productId);

  if (existingProduct) {
    existingProduct.quantity = Math.min(
      maxQuantity,
      Math.max(
        draftQuantityLimits.min,
        existingProduct.quantity + payload.quantity,
      ),
    );
    return;
  }

  group.products.push({
    id: payload.productId,
    name: payload.name,
    variant: payload.variant,
    priceCny: payload.priceCny,
    priceVnd: payload.priceVnd,
    thumbnailUrl: payload.thumbnailUrl,
    sku: payload.sku,
    maxStock: payload.maxStock,
    isOutOfStock: payload.isOutOfStock,
    quantity: Math.min(
      maxQuantity,
      Math.max(draftQuantityLimits.min, payload.quantity),
    ),
    isCustomPricing: payload.isCustomPricing,
    taxRatePercent: 0,
  });
}

export function validateStagedDraftProducts(
  groups: DraftProductGroup[],
  stagedItems: StagedDraftProduct[],
  sellerName: string,
): AddDraftProductResult {
  const simulatedGroups: DraftProductGroup[] = groups.map(group => ({
    ...group,
    products: group.products.map(product => ({ ...product })),
  }));

  for (const staged of stagedItems) {
    const payload = buildAddDraftProductPayloadFromSuggestion(
      staged.suggestion,
      staged.quantity,
      sellerName,
    );
    const result = validateAddDraftProduct(
      simulatedGroups,
      payload,
      staged.quantity,
    );

    if (!result.success) {
      return result;
    }

    simulateAddDraftProduct(simulatedGroups, payload);
  }

  return { success: true };
}

export function mergeSuggestionsWithPreferences(
  suggestions: ProductSuggestionItem[],
  productPreferences: PreferenceEntry[],
  query: string,
): DraftProductSuggestionListItem[] {
  const normalizedQuery = query.trim();
  const now = Date.now();
  const loadedIds = new Set(suggestions.map(item => String(item.id)));
  const merged: DraftProductSuggestionListItem[] = [];
  const scores = new Map<string, number>();

  for (const entry of sortPreferenceEntries(productPreferences)) {
    scores.set(entry.id, computePreferenceScore(entry, now));
  }

  for (const entry of sortPreferenceEntries(productPreferences)) {
    if (loadedIds.has(entry.id)) {
      continue;
    }

    const searchProduct = preferenceEntryToSearchProduct(entry);
    if (searchProduct == null) {
      continue;
    }

    if (
      normalizedQuery &&
      filterSearchProducts([searchProduct], normalizedQuery).length === 0
    ) {
      continue;
    }

    const suggestion = searchProductToSuggestionItem(searchProduct);
    if (suggestion == null) {
      continue;
    }

    merged.push({
      suggestion,
      isPreferred: true,
    });
    loadedIds.add(entry.id);
  }

  for (const suggestion of suggestions) {
    const id = String(suggestion.id);
    if (loadedIds.has(id)) {
      continue;
    }

    if (
      normalizedQuery &&
      filterSearchProducts([suggestionToSearchProduct(suggestion, '')], normalizedQuery)
        .length === 0
    ) {
      continue;
    }

    merged.push({
      suggestion,
      isPreferred: scores.has(id),
    });
    loadedIds.add(id);
  }

  return merged.sort((a, b) => {
    const scoreA = scores.get(String(a.suggestion.id)) ?? 0;
    const scoreB = scores.get(String(b.suggestion.id)) ?? 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    if (a.isPreferred !== b.isPreferred) {
      return a.isPreferred ? -1 : 1;
    }

    return a.suggestion.name.localeCompare(b.suggestion.name, 'vi');
  });
}
