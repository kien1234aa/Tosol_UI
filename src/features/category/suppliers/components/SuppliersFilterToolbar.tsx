import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type { SupplierListStatusFilter } from '@services/category/categorySupplierSlice';

const STATUS_OPTIONS: { key: SupplierListStatusFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'inactive', label: 'Không hoạt động' },
];

export type SuppliersFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  statusKey: SupplierListStatusFilter;
  onStatusChange: (k: SupplierListStatusFilter) => void;
} & ListScreenToolbarCreateActions;

export function SuppliersFilterToolbar({
  query,
  onQueryChange,
  statusKey,
  onStatusChange,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: SuppliersFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);
  const filtersActive = statusKey !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo tên, mã, email, số điện thoại"
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={() => onStatusChange('all')}
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
          title="Trạng thái"
          value={statusKey}
          options={statusOptions}
          onChange={onStatusChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
