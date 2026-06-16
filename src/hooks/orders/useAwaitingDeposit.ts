import { useCallback, useMemo, useState } from 'react';
import {
  mockAvailableBalanceVnd,
  mockAwaitingDepositItems,
} from '@/src/configs/orders';
import type {
  AwaitingDepositItem,
  AwaitingDepositTotals,
} from '@/src/types/orders/awaitingDeposit.types';

export interface UseAwaitingDepositResult {
  items: AwaitingDepositItem[];
  totals: AwaitingDepositTotals;
  availableBalanceVnd: number;
  allSelected: boolean;
  isSelected: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onToggleSelectAll: () => void;
  clearSelection: () => void;
  removeSelected: () => void;
}

export function useAwaitingDeposit(): UseAwaitingDepositResult {
  const [items, setItems] = useState<AwaitingDepositItem[]>(
    mockAwaitingDepositItems,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const totals = useMemo<AwaitingDepositTotals>(() => {
    return items.reduce<AwaitingDepositTotals>(
      (acc, item) => {
        if (!selectedIds.has(item.id)) {
          return acc;
        }
        return {
          goodsVnd: acc.goodsVnd + item.goodsVnd,
          payableVnd: acc.payableVnd + item.payableVnd,
          selectedCount: acc.selectedCount + 1,
        };
      },
      { goodsVnd: 0, payableVnd: 0, selectedCount: 0 },
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
