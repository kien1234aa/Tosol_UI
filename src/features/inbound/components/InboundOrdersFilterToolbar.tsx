import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type InboundOrderListPreset =
  | 'all'
  | 'pending'
  | 'receiving'
  | 'completed'
  | 'cancelled';

const PRESET_OPTIONS: { key: InboundOrderListPreset; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'receiving', label: 'Đang nhận' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export type InboundOrdersFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  preset: InboundOrderListPreset;
  onPresetChange: (p: InboundOrderListPreset) => void;
};

export function InboundOrdersFilterToolbar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
}: InboundOrdersFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const presetOptions = useMemo(() => PRESET_OPTIONS, []);
  const filtersActive = preset !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã lệnh nhập, đơn mua..."
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
