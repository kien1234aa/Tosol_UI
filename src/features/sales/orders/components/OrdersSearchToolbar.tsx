import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';

export type OrdersSearchToolbarProps = {
  onAdvancedFilter?: () => void;
  onCreateOrder?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
};

/** Thanh tìm + hành động danh sách đơn — dùng chrome dùng chung. */
export function OrdersSearchToolbar({
  onAdvancedFilter,
  onCreateOrder,
  onRefresh,
  refreshing = false,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: OrdersSearchToolbarProps) {
  const { t } = useTranslation();

  return (
    <ListScreenSearchToolbar
      searchPlaceholder={
        searchPlaceholder ?? t('orders.list.searchPlaceholder')
      }
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onFilterPress={onAdvancedFilter}
      filterButtonTitle={t('orders.list.advancedFilter')}
      onRefresh={onRefresh}
      refreshing={refreshing}
      refreshA11y={t('orders.list.refreshA11y')}
      primaryActionTitle={t('orders.actions.createOrderShort')}
      onPrimaryAction={onCreateOrder}
    />
  );
}
