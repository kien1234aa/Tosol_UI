import { useCallback, useMemo, useState } from 'react';
import { orderStatusLabels, ordersCopy } from '@/src/configs/orders';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  removeOrderItem,
  selectFilteredOrderItems,
  selectOrderStatusFilter,
  setOrderStatusFilter,
} from '@/src/redux/orders';
import type {
  OrderListItem,
  OrderStatusFilter,
} from '@/src/types/orders/orders.types';

export interface OrderFilterOption {
  key: OrderStatusFilter;
  label: string;
}

export interface UseOrdersListResult {
  orders: OrderListItem[];
  statusFilter: OrderStatusFilter;
  isFilterOpen: boolean;
  filterOptions: OrderFilterOption[];
  emptyMessage: string;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onSelectFilter: (filter: OrderStatusFilter) => void;
  onRemoveOrder: (orderId: string) => void;
  onOrderAction: (orderId: string, action: 'view' | 'pay' | 'cancel') => void;
}

export function useOrdersList(): UseOrdersListResult {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectFilteredOrderItems);
  const statusFilter = useAppSelector(selectOrderStatusFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = useMemo<OrderFilterOption[]>(
    () => [
      { key: 'all', label: ordersCopy.filterAll },
      ...Object.entries(orderStatusLabels).map(([key, label]) => ({
        key: key as OrderStatusFilter,
        label,
      })),
    ],
    [],
  );

  const emptyMessage =
    statusFilter === 'all'
      ? ordersCopy.emptyOrders
      : ordersCopy.emptyFilteredOrders;

  const onOpenFilter = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  const onCloseFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const onSelectFilter = useCallback(
    (filter: OrderStatusFilter) => {
      dispatch(setOrderStatusFilter(filter));
      setIsFilterOpen(false);
    },
    [dispatch],
  );

  const onRemoveOrder = useCallback(
    (orderId: string) => {
      dispatch(removeOrderItem(orderId));
    },
    [dispatch],
  );

  const onOrderAction = useCallback(
    (_orderId: string, _action: 'view' | 'pay' | 'cancel') => {
      // Order action routes are not registered yet.
    },
    [],
  );

  return {
    orders,
    statusFilter,
    isFilterOpen,
    filterOptions,
    emptyMessage,
    onOpenFilter,
    onCloseFilter,
    onSelectFilter,
    onRemoveOrder,
    onOrderAction,
  };
}
