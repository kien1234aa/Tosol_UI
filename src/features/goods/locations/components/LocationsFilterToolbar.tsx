import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type { LocationTypeFilter } from '@services/warehouse/locationsAPI';

const TYPE_OPTIONS: { key: LocationTypeFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả loại' },
  { key: 'storage', label: 'Lưu trữ (storage)' },
  { key: 'picking', label: 'Picking' },
  { key: 'staging', label: 'Staging' },
];

export type LocationsFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  typeFilter: LocationTypeFilter;
  onTypeFilterChange: (key: LocationTypeFilter) => void;
} & ListScreenToolbarCreateActions;

export function LocationsFilterToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: LocationsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const typeOptions = useMemo(() => TYPE_OPTIONS, []);
  const filtersActive = typeFilter !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã, tên, kho…"
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={() => onTypeFilterChange('all')}
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
          title="Loại vị trí"
          value={typeFilter}
          options={typeOptions}
          onChange={onTypeFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
