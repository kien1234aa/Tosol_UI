import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type { SettlementListFilter } from '../settlementListTypes';

const STATUS_OPTIONS: { key: SettlementListFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'draft', label: 'Nháp' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'settled', label: 'Đã quyết toán' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export type SettlementsFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  filter: SettlementListFilter;
  onFilterChange: (f: SettlementListFilter) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
};

export function SettlementsFilterToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  filtersActive,
  onClearFilters,
}: SettlementsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo số đối soát..."
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Trạng thái"
          value={filter}
          options={statusOptions}
          onChange={onFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
