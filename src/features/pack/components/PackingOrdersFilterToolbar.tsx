import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type PackingOrderListPreset =
  | 'all'
  | 'pending'
  | 'packing'
  | 'unpack'
  | 'cancelled';

const PRESET_OPTIONS: { key: PackingOrderListPreset; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'packing', label: 'Đang đóng gói' },
  { key: 'unpack', label: 'Chờ mở hộp' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export type PackingOrdersFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  preset: PackingOrderListPreset;
  onPresetChange: (p: PackingOrderListPreset) => void;
};

export function PackingOrdersFilterToolbar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
}: PackingOrdersFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const presetOptions = useMemo(() => PRESET_OPTIONS, []);
  const filtersActive = preset !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã lệnh đóng gói, đơn bán..."
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={() => onPresetChange('all')}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Trạng thái"
          value={preset}
          options={presetOptions}
          onChange={onPresetChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
