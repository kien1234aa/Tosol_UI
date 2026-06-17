import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { countActiveOrderFilters } from '@/src/configs/orders/orderFilters.constants';
import { ordersCopy } from '@/src/configs/orders';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  fetchOrdersThunk,
  selectFilteredOrderItems,
  selectHasMoreOrders,
  selectIsLoadingMoreOrders,
  selectIsLoadingOrders,
  selectOrderListFilters,
  selectOrderListSearch,
  selectOrdersCurrentPage,
  selectOrdersListError,
  setOrderListFilters,
  setOrderListSearch,
} from '@/src/redux/orders';
import type { OrderListItem } from '@/src/types/orders/orders.types';
import type { OrderAdvancedFilters } from '@/src/types/orders/orderFilters.types';

const SEARCH_DEBOUNCE_MS = 450;

export interface UseOrdersListResult {
  orders: OrderListItem[];
  listFilters: OrderAdvancedFilters;
  searchQuery: string;
  activeFilterCount: number;
  isFilterOpen: boolean;
  emptyMessage: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadError: string | null;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onApplyFilters: (filters: OrderAdvancedFilters) => void;
  onSearchChange: (value: string) => void;
  onRemoveOrder: (orderId: string) => void;
  onOrderAction: (orderId: string, action: 'view' | 'edit' | 'pay' | 'cancel') => void;
  reloadOrders: () => void;
  loadMoreOrders: () => void;
}

export function useOrdersList(): UseOrdersListResult {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectFilteredOrderItems);
  const listFilters = useAppSelector(selectOrderListFilters);
  const listSearch = useAppSelector(selectOrderListSearch);
  const isLoading = useAppSelector(selectIsLoadingOrders);
  const isLoadingMore = useAppSelector(selectIsLoadingMoreOrders);
  const hasMore = useAppSelector(selectHasMoreOrders);
  const loadError = useAppSelector(selectOrdersListError);
  const currentPage = useAppSelector(selectOrdersCurrentPage);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => listSearch);
  const listSearchRef = useRef(listSearch);
  listSearchRef.current = listSearch;

  const activeFilterCount = useMemo(
    () => countActiveOrderFilters(listFilters),
    [listFilters],
  );

  const hasSearch = Boolean(listSearch.trim());

  const emptyMessage = hasSearch
    ? ordersCopy.emptySearchResults
    : activeFilterCount === 0
      ? ordersCopy.emptyOrders
      : ordersCopy.emptyFilteredOrders;

  const reloadOrders = useCallback(() => {
    void dispatch(fetchOrdersThunk({ page: 1, append: false }));
  }, [dispatch]);

  const loadMoreOrders = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    void dispatch(
      fetchOrdersThunk({
        page: currentPage + 1,
        append: true,
      }),
    );
  }, [currentPage, dispatch, hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const next = searchQuery.trim();
      if (next === listSearchRef.current) {
        return;
      }
      dispatch(setOrderListSearch(next));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchQuery]);

  useEffect(() => {
    reloadOrders();
  }, [listFilters, listSearch, reloadOrders]);

  const onOpenFilter = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  const onCloseFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const onApplyFilters = useCallback(
    (filters: OrderAdvancedFilters) => {
      dispatch(setOrderListFilters(filters));
    },
    [dispatch],
  );

  const onSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const onRemoveOrder = useCallback((_orderId: string) => {
    // Delete order API is not wired yet.
  }, []);

  const onOrderAction = useCallback(
    (_orderId: string, _action: 'view' | 'edit' | 'pay' | 'cancel') => {
      // Order action routes are not registered yet.
    },
    [],
  );

  return {
    orders,
    listFilters,
    searchQuery,
    activeFilterCount,
    isFilterOpen,
    emptyMessage,
    isLoading,
    isLoadingMore,
    hasMore,
    loadError,
    onOpenFilter,
    onCloseFilter,
    onApplyFilters,
    onSearchChange,
    onRemoveOrder,
    onOrderAction,
    reloadOrders,
    loadMoreOrders,
  };
}
