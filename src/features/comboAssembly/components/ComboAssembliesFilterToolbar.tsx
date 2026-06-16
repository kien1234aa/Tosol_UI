import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type ComboAssemblyListPreset =
  | 'all'
  | 'requested'
  | 'completed'
  | 'cancelled';

const STATUS_OPTIONS: { key: ComboAssemblyListPreset; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'requested', label: 'Chờ xử lý' },
  { key: 'completed', label: 'Đã đóng gói' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export type ComboAssembliesFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  preset: ComboAssemblyListPreset;
  onPresetChange: (p: ComboAssemblyListPreset) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
} & ListScreenToolbarCreateActions;

export function ComboAssembliesFilterToolbar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
  filtersActive,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: ComboAssembliesFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã lệnh, SKU combo..."
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
          value={preset}
          options={statusOptions}
          onChange={onPresetChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
