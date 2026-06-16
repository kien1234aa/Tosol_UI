import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import {
  BANK_ACCOUNT_IS_DEFAULT_OPTIONS,
  BANK_ACCOUNT_STATUS_OPTIONS,
  type BankAccountIsDefaultFilter,
  type BankAccountStatusFilter,
} from '../bankAccountListFilterOptions';

export type BankAccountsFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  isDefaultFilter: BankAccountIsDefaultFilter;
  onIsDefaultFilterChange: (key: BankAccountIsDefaultFilter) => void;
  statusFilter: BankAccountStatusFilter;
  onStatusFilterChange: (key: BankAccountStatusFilter) => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
} & ListScreenToolbarCreateActions;

export function BankAccountsFilterToolbar({
  query,
  onQueryChange,
  isDefaultFilter,
  onIsDefaultFilterChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive: filtersActiveProp,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: BankAccountsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const defaultOptions = useMemo(() => BANK_ACCOUNT_IS_DEFAULT_OPTIONS, []);
  const statusOptions = useMemo(() => BANK_ACCOUNT_STATUS_OPTIONS, []);
  const filtersActive =
    filtersActiveProp ??
    (statusFilter !== 'all' || isDefaultFilter !== 'all');

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo tên ngân hàng, số tài khoản..."
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
        onRefresh={onRefresh}
        refreshing={refreshing}
        primaryActionTitle={primaryActionTitle}
        onPrimaryAction={onPrimaryAction}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Mặc định"
          value={isDefaultFilter}
          options={defaultOptions}
          onChange={onIsDefaultFilterChange}
        />
        <ListScreenFilterPickerSection
          title="Trạng thái"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
