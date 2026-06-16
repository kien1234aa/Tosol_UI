import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type PriceListStatusFilterKey = 'all' | 'active' | 'inactive';
export type PriceListDefaultFilterKey = 'all' | 'default' | 'non_default';

const STATUS_OPTIONS: { key: PriceListStatusFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'inactive', label: 'Ngưng' },
];

const DEFAULT_OPTIONS: { key: PriceListDefaultFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'default', label: 'Mặc định' },
  { key: 'non_default', label: 'Không mặc định' },
];

export type PriceListsFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  statusKey: PriceListStatusFilterKey;
  onStatusChange: (k: PriceListStatusFilterKey) => void;
  defaultKey: PriceListDefaultFilterKey;
  onDefaultChange: (k: PriceListDefaultFilterKey) => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
} & ListScreenToolbarCreateActions;

export function PriceListsFilterToolbar({
  query,
  onQueryChange,
  statusKey,
  onStatusChange,
  defaultKey,
  onDefaultChange,
  filtersActive: filtersActiveProp,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: PriceListsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);
  const defaultOptions = useMemo(() => DEFAULT_OPTIONS, []);
  const filtersActive =
    filtersActiveProp ?? (statusKey !== 'all' || defaultKey !== 'all');

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo tên hoặc mã..."
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
          value={statusKey}
          options={statusOptions}
          onChange={onStatusChange}
        />
        <ListScreenFilterPickerSection
          title="Mặc định"
          value={defaultKey}
          options={defaultOptions}
          onChange={onDefaultChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
