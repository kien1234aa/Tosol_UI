import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';

export type PaymentsFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
  onOpenAdvanced?: () => void;
};

export function PaymentsFilterToolbar({
  query,
  onQueryChange,
  filtersActive,
  onClearFilters,
  onOpenAdvanced,
}: PaymentsFilterToolbarProps) {
  const { t } = useTranslation();

  return (
    <ListScreenSearchToolbar
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder="Tìm theo mã thanh toán, mã đơn hàng"
      onFilterPress={onOpenAdvanced}
      filterButtonTitle={t('common.listToolbar.advancedFilter')}
      filtersActive={filtersActive}
      onClearFilters={onClearFilters}
    />
  );
}
