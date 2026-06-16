import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type TransferOrderListPreset =
  | 'all'
  | 'pending'
  | 'in_transit'
  | 'receiving'
  | 'completed';

const PRESET_OPTIONS: { key: TransferOrderListPreset; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'in_transit', label: 'Đang chuyển' },
  { key: 'receiving', label: 'Đang nhận' },
  { key: 'completed', label: 'Hoàn tất' },
];

export type TransferOrdersFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  preset: TransferOrderListPreset;
  onPresetChange: (p: TransferOrderListPreset) => void;
};

export function TransferOrdersFilterToolbar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
}: TransferOrdersFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const presetOptions = useMemo(() => PRESET_OPTIONS, []);
  const filtersActive = preset !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã lệnh chuyển, kho..."
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
