import { useCallback, useMemo, useState } from 'react';
import {
  mockAvailableBalanceVnd,
  mockAwaitingPaymentItems,
} from '@/src/configs/orders';
import type {
  AwaitingPaymentItem,
  AwaitingPaymentTotals,
} from '@/src/types/orders/awaitingPayment.types';

export interface UseAwaitingPaymentResult {
  items: AwaitingPaymentItem[];
  totals: AwaitingPaymentTotals;
  availableBalanceVnd: number;
  allSelected: boolean;
  isSelected: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onToggleSelectAll: () => void;
  clearSelection: () => void;
  removeSelected: () => void;
}

export function useAwaitingPayment(): UseAwaitingPaymentResult {
  const [items, setItems] = useState<AwaitingPaymentItem[]>(
    mockAwaitingPaymentItems,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const totals = useMemo<AwaitingPaymentTotals>(() => {
    return items.reduce<AwaitingPaymentTotals>(
      (acc, item) => {
        if (!selectedIds.has(item.id)) {
          return acc;
        }
        return {
          payableVnd: acc.payableVnd + item.payableVnd,
          selectedCount: acc.selectedCount + 1,
        };
      },
      { payableVnd: 0, selectedCount: 0 },
    );
  }, [items, selectedIds]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const onToggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const onToggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === items.length) {
        return new Set();
      }
      return new Set(items.map(item => item.id));
    });
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const removeSelected = useCallback(() => {
    setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  return {
    items,
    totals,
    availableBalanceVnd: mockAvailableBalanceVnd,
    allSelected,
    isSelected,
    onToggleItem,
    onToggleSelectAll,
    clearSelection,
    removeSelected,
  };
}
