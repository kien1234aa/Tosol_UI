import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

const STATUS_OPTIONS: { key: 'all' | 'active' | 'inactive'; label: string }[] =
  [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'active', label: 'Hoạt động' },
    { key: 'inactive', label: 'Ngưng' },
  ];

export type WebhooksFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (key: 'all' | 'active' | 'inactive') => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
} & ListScreenToolbarCreateActions;

export function WebhooksFilterToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive: filtersActiveProp,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: WebhooksFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);
  const filtersActive = filtersActiveProp ?? statusFilter !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo URL, mô tả…"
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
          title="Trạng thái"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
