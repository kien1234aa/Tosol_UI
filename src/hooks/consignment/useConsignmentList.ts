import { useCallback, useMemo, useState } from 'react';
import {
  consignmentListCopy,
  consignmentStatusLabels,
} from '@/src/configs/consignment';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  removeConsignmentOrder,
  selectConsignmentStatusFilter,
  selectFilteredConsignmentItems,
  setConsignmentStatusFilter,
} from '@/src/redux/consignment';
import type {
  ConsignmentOrderItem,
  ConsignmentStatusFilter,
} from '@/src/types/consignment/consignment.types';

export interface ConsignmentFilterOption {
  key: ConsignmentStatusFilter;
  label: string;
}

export interface UseConsignmentListResult {
  orders: ConsignmentOrderItem[];
  statusFilter: ConsignmentStatusFilter;
  isFilterOpen: boolean;
  filterOptions: ConsignmentFilterOption[];
  emptyMessage: string;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onSelectFilter: (filter: ConsignmentStatusFilter) => void;
  onRemoveOrder: (orderId: string) => void;
}

export function useConsignmentList(): UseConsignmentListResult {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectFilteredConsignmentItems);
  const statusFilter = useAppSelector(selectConsignmentStatusFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = useMemo<ConsignmentFilterOption[]>(
    () => [
      { key: 'all', label: consignmentListCopy.filterAll },
      ...Object.entries(consignmentStatusLabels).map(([key, label]) => ({
        key: key as ConsignmentStatusFilter,
        label,
      })),
    ],
    [],
  );

  const emptyMessage =
    statusFilter === 'all'
      ? consignmentListCopy.empty
      : consignmentListCopy.emptyFiltered;

  const onOpenFilter = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  const onCloseFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const onSelectFilter = useCallback(
    (filter: ConsignmentStatusFilter) => {
      dispatch(setConsignmentStatusFilter(filter));
      setIsFilterOpen(false);
    },
    [dispatch],
  );

  const onRemoveOrder = useCallback(
    (orderId: string) => {
      dispatch(removeConsignmentOrder(orderId));
    },
    [dispatch],
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
  };
}
