import { createSelector } from '@reduxjs/toolkit';
import {
  buildPreferenceStorageKey,
  buildShopContextKey,
  buildShippingMethodContextKey,
  buildWarehouseContextKey,
  preferenceKeys,
  preferenceSuggestionLimit,
} from '@/src/configs/preferences/preferences.constants';
import {
  mergePreferenceBuckets,
  pickSuggestedSelectOptions,
  preferenceEntryToCustomerSearchResult,
  sortPreferenceEntries,
} from '@/src/helpers/preferences/preferences.helpers';
import type { RootState } from '@/src/redux/rootReducer';
import type { CreateOrderSelectOption } from '@/src/types/orders/createOrder.types';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';
import type { PreferenceEntry } from '@/src/types/preferences/preferences.types';

const selectPreferencesByKey = (state: RootState) => state.preferences.byKey;

export function selectPreferenceEntries(
  key: string,
  contextKey?: string,
): (state: RootState) => PreferenceEntry[] {
  const storageKey = buildPreferenceStorageKey(key, contextKey);

  return createSelector(selectPreferencesByKey, byKey => byKey[storageKey] ?? []);
}

export const selectShopPreferences = selectPreferenceEntries(preferenceKeys.shop);

export const selectCustomerPreferences = selectPreferenceEntries(
  preferenceKeys.customer,
);

export const selectSearchQueryPreferences = selectPreferenceEntries(
  preferenceKeys.searchQuery,
);

export const selectSearchWarehousePreferences = selectPreferenceEntries(
  preferenceKeys.searchWarehouse,
);

export const selectProductPreferences = selectPreferenceEntries(
  preferenceKeys.product,
);

export function selectPackagingWarehousePreferences(shopId: number | null) {
  return createSelector(selectPreferencesByKey, byKey => {
    const global = byKey[preferenceKeys.packagingWarehouse] ?? [];

    if (shopId == null) {
      return global;
    }

    const scoped =
      byKey[
        buildPreferenceStorageKey(
          preferenceKeys.packagingWarehouse,
          buildShopContextKey(shopId),
        )
      ] ?? [];

    return mergePreferenceBuckets(scoped, global);
  });
}

export function selectShippingPartnerPreferences(
  shippingMethod: string,
  warehouseId: number | null,
) {
  return createSelector(selectPreferencesByKey, byKey => {
    const methodBucket =
      byKey[
        buildPreferenceStorageKey(
          preferenceKeys.shippingPartner,
          buildShippingMethodContextKey(shippingMethod),
        )
      ] ?? [];

    if (warehouseId == null) {
      return methodBucket;
    }

    const warehouseBucket =
      byKey[
        buildPreferenceStorageKey(
          preferenceKeys.shippingPartner,
          buildWarehouseContextKey(warehouseId),
        )
      ] ?? [];

    return mergePreferenceBuckets(warehouseBucket, methodBucket);
  });
}

export function selectSuggestedSelectOptions(
  key: string,
  options: CreateOrderSelectOption[],
  contextKey?: string,
) {
  return createSelector(
    selectPreferenceEntries(key, contextKey),
    entries => pickSuggestedSelectOptions(options, entries, preferenceSuggestionLimit),
  );
}

export const selectRecentCustomerSuggestions = createSelector(
  selectCustomerPreferences,
  (entries): CustomerSearchResult[] => {
    return sortPreferenceEntries(entries)
      .slice(0, preferenceSuggestionLimit)
      .map(preferenceEntryToCustomerSearchResult)
      .filter((item): item is CustomerSearchResult => item != null);
  },
);

export const selectRecentSearchQueries = createSelector(
  selectSearchQueryPreferences,
  entries =>
    sortPreferenceEntries(entries)
      .slice(0, preferenceSuggestionLimit)
      .map(entry => entry.label),
);

export function selectSuggestedWarehouseIds(warehouseIds: number[]) {
  return createSelector(selectSearchWarehousePreferences, entries => {
    const validSet = new Set(warehouseIds.map(String));
    return sortPreferenceEntries(entries)
      .filter(entry => validSet.has(entry.id))
      .slice(0, preferenceSuggestionLimit)
      .map(entry => Number(entry.id));
  });
}
