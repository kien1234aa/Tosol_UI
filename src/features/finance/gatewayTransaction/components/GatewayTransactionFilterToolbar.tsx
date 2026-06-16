import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';

export type GatewayTransactionFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
  onOpenAdvanced?: () => void;
};

export function GatewayTransactionFilterToolbar({
  query,
  onQueryChange,
  filtersActive,
  onClearFilters,
  onOpenAdvanced,
}: GatewayTransactionFilterToolbarProps) {
  const { t } = useTranslation();

  return (
    <ListScreenSearchToolbar
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder="Tìm theo mã đơn hàng, mã giao dịch.."
      onFilterPress={onOpenAdvanced}
      filterButtonTitle={t('common.listToolbar.advancedFilter')}
      filtersActive={filtersActive}
      onClearFilters={onClearFilters}
    />
  );
}
