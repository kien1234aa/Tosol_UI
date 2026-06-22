import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { customersService } from '@/src/apis/customers/customers.api';
import { customerSearchMinLength } from '@/src/configs/api';
import { mapCustomerToSearchResult } from '@/src/configs/createOrder/createOrder.constants';
import { countActiveOrderFilters } from '@/src/configs/orders/orderFilters.constants';
import { ordersCopy } from '@/src/configs/orders';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { useTabInitialLoad } from '@/src/hooks/common/useTabInitialLoad';
import {
  clearOrderListCustomerFilter,
  fetchOrdersThunk,
  selectFilteredOrderItems,
  selectHasMoreOrders,
  selectHasOrderListCustomerFilter,
  selectIsLoadingMoreOrders,
  selectIsLoadingOrders,
  selectOrderListCustomerId,
  selectOrderListCustomerName,
  selectOrderListFilters,
  selectOrdersCurrentPage,
  selectOrdersListError,
  selectOrdersListHasCache,
  selectOrdersListStatus,
  setOrderListCustomerFilter,
  setOrderListFilters,
} from '@/src/redux/orders';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';
import type { OrderListItem } from '@/src/types/orders/orders.types';
import type { OrderAdvancedFilters } from '@/src/types/orders/orderFilters.types';

const CUSTOMER_SEARCH_DEBOUNCE_MS = 350;

export interface UseOrdersListResult {
  orders: OrderListItem[];
  listFilters: OrderAdvancedFilters;
  customerQuery: string;
  customerResults: CustomerSearchResult[];
  selectedCustomerName: string | null;
  isSearchingCustomers: boolean;
  customerSearchError: string | null;
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
  onSelectCustomer: (customer: CustomerSearchResult) => void;
  onClearCustomer: () => void;
  onRemoveOrder: (orderId: string) => void;
  onOrderAction: (orderId: string, action: 'view' | 'edit' | 'pay' | 'cancel') => void;
  reloadOrders: () => void;
  loadMoreOrders: () => void;
}

export function useOrdersList(): UseOrdersListResult {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectFilteredOrderItems);
  const listFilters = useAppSelector(selectOrderListFilters);
  const listCustomerId = useAppSelector(selectOrderListCustomerId);
  const listCustomerName = useAppSelector(selectOrderListCustomerName);
  const hasCustomerFilter = useAppSelector(selectHasOrderListCustomerFilter);
  const isLoading = useAppSelector(selectIsLoadingOrders);
  const isLoadingMore = useAppSelector(selectIsLoadingMoreOrders);
  const hasMore = useAppSelector(selectHasMoreOrders);
  const loadError = useAppSelector(selectOrdersListError);
  const listStatus = useAppSelector(selectOrdersListStatus);
  const hasCache = useAppSelector(selectOrdersListHasCache);
  const currentPage = useAppSelector(selectOrdersCurrentPage);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerSearchResult[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);
  const customerSearchRequestId = useRef(0);

  const listQueryKey = useMemo(
    () => JSON.stringify({ filters: listFilters, customerId: listCustomerId }),
    [listCustomerId, listFilters],
  );

  const activeFilterCount = useMemo(
    () => countActiveOrderFilters(listFilters),
    [listFilters],
  );

  const emptyMessage = hasCustomerFilter
    ? ordersCopy.emptyCustomerSearchOrders
    : activeFilterCount === 0
      ? ordersCopy.emptyOrders
      : ordersCopy.emptyFilteredOrders;

  const loadOrders = useCallback(() => {
    void dispatch(fetchOrdersThunk({ page: 1, append: false }));
  }, [dispatch]);

  const reloadOrders = useCallback(() => {
    void dispatch(fetchOrdersThunk({ page: 1, append: false, force: true }));
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

  useTabInitialLoad({
    hasCache,
    hasError: listStatus === 'error',
    load: loadOrders,
    reloadKey: listQueryKey,
  });

  useEffect(() => {
    if (listCustomerName) {
      return;
    }

    const trimmed = customerQuery.trim();

    if (trimmed.length < customerSearchMinLength) {
      customerSearchRequestId.current += 1;
      setCustomerResults([]);
      setCustomerSearchError(null);
      setIsSearchingCustomers(false);
      return;
    }

    const requestId = customerSearchRequestId.current + 1;
    customerSearchRequestId.current = requestId;
    setIsSearchingCustomers(true);
    setCustomerSearchError(null);

    const timeoutId = setTimeout(() => {
      void customersService
        .search(trimmed)
        .then(records => {
          if (customerSearchRequestId.current !== requestId) {
            return;
          }

          setCustomerResults(records.map(mapCustomerToSearchResult));
        })
        .catch(error => {
          if (customerSearchRequestId.current !== requestId) {
            return;
          }

          setCustomerResults([]);
          setCustomerSearchError(
            error instanceof Error
              ? error.message
              : ordersCopy.searchCustomerError,
          );
        })
        .finally(() => {
          if (customerSearchRequestId.current === requestId) {
            setIsSearchingCustomers(false);
          }
        });
    }, CUSTOMER_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [customerQuery, listCustomerName]);

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
    setCustomerQuery(value);
  }, []);

  const onSelectCustomer = useCallback(
    (customer: CustomerSearchResult) => {
      customerSearchRequestId.current += 1;
      setCustomerQuery('');
      setCustomerResults([]);
      setCustomerSearchError(null);
      setIsSearchingCustomers(false);
      dispatch(
        setOrderListCustomerFilter({
          customerId: customer.id,
          customerName: customer.name,
        }),
      );
    },
    [dispatch],
  );

  const onClearCustomer = useCallback(() => {
    customerSearchRequestId.current += 1;
    setCustomerQuery('');
    setCustomerResults([]);
    setCustomerSearchError(null);
    setIsSearchingCustomers(false);
    dispatch(clearOrderListCustomerFilter());
  }, [dispatch]);

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
    customerQuery,
    customerResults,
    selectedCustomerName: listCustomerName,
    isSearchingCustomers,
    customerSearchError,
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
    onSelectCustomer,
    onClearCustomer,
    onRemoveOrder,
    onOrderAction,
    reloadOrders,
    loadMoreOrders,
  };
}
