import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { isSameWarehouseSelection } from '@/src/configs/warehouse';
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
  setQuery: (value: string) => void;
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
        .catch(message => {
          Alert.alert('Không thể chuyển kho', String(message));
        });
    },
    [
      dispatch,
      isSwitchingWarehouse,
      reloadProducts,
      selectedWarehouseId,
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
    setQuery,
    onSelectWarehouse,
    loadMoreProducts,
    reloadProducts,
  };
}
