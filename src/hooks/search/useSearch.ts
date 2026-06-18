import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { isSameWarehouseSelection, isAllWarehouses } from '@/src/configs/warehouse';
import {
  preferenceKeys,
  searchQueryPreferenceMinLength,
} from '@/src/configs/preferences/preferences.constants';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  selectAuthWarehouses,
  selectCurrentWarehouseId,
  selectIsSwitchingWarehouse,
  selectSelectedWarehouseLabel,
  switchWarehouseThunk,
} from '@/src/redux/login';
import {
  fetchProductsThunk,
  selectFilteredSearchProducts,
  selectHasMoreSearchProducts,
  selectIsLoadingMoreSearchProducts,
  selectIsLoadingSearchProducts,
  selectSearchCurrentPage,
  selectSearchProductsError,
  selectSearchQuery,
  setSearchQuery,
} from '@/src/redux/search';
import {
  recordPreference,
  selectRecentSearchQueries,
  selectSuggestedWarehouseIds,
} from '@/src/redux/preferences';
import type { AuthWarehouse } from '@/src/types/login/auth.types';
import type { SearchProduct } from '@/src/types/search/search.types';

export interface UseSearchResult {
  query: string;
  warehouses: AuthWarehouse[];
  selectedWarehouseId: number | null;
  selectedWarehouseLabel: string;
  isSwitchingWarehouse: boolean;
  products: SearchProduct[];
  isLoadingProducts: boolean;
  isLoadingMoreProducts: boolean;
  hasMoreProducts: boolean;
  productsError: string | null;
  recentQueries: string[];
  suggestedWarehouseIds: number[];
  setQuery: (value: string) => void;
  onSelectRecentQuery: (query: string) => void;
  onSelectWarehouse: (warehouseId: number | null) => void;
  loadMoreProducts: () => void;
  reloadProducts: () => void;
}

export function useSearch(): UseSearchResult {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectSearchQuery);
  const warehouses = useAppSelector(selectAuthWarehouses);
  const selectedWarehouseId = useAppSelector(selectCurrentWarehouseId);
  const selectedWarehouseLabel = useAppSelector(selectSelectedWarehouseLabel);
  const isSwitchingWarehouse = useAppSelector(selectIsSwitchingWarehouse);
  const products = useAppSelector(selectFilteredSearchProducts);
  const isLoadingProducts = useAppSelector(selectIsLoadingSearchProducts);
  const isLoadingMoreProducts = useAppSelector(selectIsLoadingMoreSearchProducts);
  const hasMoreProducts = useAppSelector(selectHasMoreSearchProducts);
  const productsError = useAppSelector(selectSearchProductsError);
  const currentPage = useAppSelector(selectSearchCurrentPage);
  const recentQueries = useAppSelector(selectRecentSearchQueries);
  const warehouseIds = useMemo(
    () => warehouses.map(item => item.id),
    [warehouses],
  );
  const selectSuggestedWarehouseIdsMemo = useMemo(
    () => selectSuggestedWarehouseIds(warehouseIds),
    [warehouseIds],
  );
  const suggestedWarehouseIds = useAppSelector(selectSuggestedWarehouseIdsMemo);
  const searchQueryRecordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const reloadProducts = useCallback(() => {
    void dispatch(fetchProductsThunk({ page: 1, append: false }));
  }, [dispatch]);

  const loadMoreProducts = useCallback(() => {
    if (!hasMoreProducts || isLoadingProducts || isLoadingMoreProducts) {
      return;
    }

    void dispatch(
      fetchProductsThunk({ page: currentPage + 1, append: true }),
    );
  }, [
    currentPage,
    dispatch,
    hasMoreProducts,
    isLoadingMoreProducts,
    isLoadingProducts,
  ]);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts, selectedWarehouseId]);

  const setQuery = useCallback(
    (value: string) => {
      dispatch(setSearchQuery(value));

      if (searchQueryRecordTimeoutRef.current) {
        clearTimeout(searchQueryRecordTimeoutRef.current);
      }

      const trimmed = value.trim();
      if (trimmed.length >= searchQueryPreferenceMinLength) {
        searchQueryRecordTimeoutRef.current = setTimeout(() => {
          dispatch(
            recordPreference({
              key: preferenceKeys.searchQuery,
              id: trimmed.toLowerCase(),
              label: trimmed,
            }),
          );
        }, 1000);
      }
    },
    [dispatch],
  );

  const onSelectRecentQuery = useCallback(
    (value: string) => {
      dispatch(setSearchQuery(value));
      dispatch(
        recordPreference({
          key: preferenceKeys.searchQuery,
          id: value.trim().toLowerCase(),
          label: value.trim(),
        }),
      );
    },
    [dispatch],
  );

  const onSelectWarehouse = useCallback(
    (warehouseId: number | null) => {
      if (
        isSameWarehouseSelection(warehouseId, selectedWarehouseId) ||
        isSwitchingWarehouse
      ) {
        return;
      }

      void dispatch(switchWarehouseThunk(warehouseId))
        .unwrap()
        .then(() => {
          if (warehouseId != null && !isAllWarehouses(warehouseId)) {
            const warehouse = warehouses.find(item => item.id === warehouseId);
            if (warehouse) {
              dispatch(
                recordPreference({
                  key: preferenceKeys.searchWarehouse,
                  id: warehouse.id,
                  label: warehouse.name,
                  subtitle: warehouse.code,
                }),
              );
            }
          }
        })
        .catch(message => {
          Alert.alert('Không thể chuyển kho', String(message));
        });
    },
    [
      dispatch,
      isSwitchingWarehouse,
      selectedWarehouseId,
      warehouses,
    ],
  );

  return {
    query,
    warehouses,
    selectedWarehouseId,
    selectedWarehouseLabel,
    isSwitchingWarehouse,
    products,
    isLoadingProducts,
    isLoadingMoreProducts,
    hasMoreProducts,
    productsError,
    recentQueries,
    suggestedWarehouseIds,
    setQuery,
    onSelectRecentQuery,
    onSelectWarehouse,
    loadMoreProducts,
    reloadProducts,
  };
}
