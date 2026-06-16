import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type OutboundOrderListPreset =
  | 'all'
  | 'pending'
  | 'picking'
  | 'ready'
  | 'completed';

const PRESET_OPTIONS: { key: OutboundOrderListPreset; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'picking', label: 'Đang lấy hàng' },
  { key: 'ready', label: 'Sẵn sàng giao' },
  { key: 'completed', label: 'Hoàn tất' },
];

export type OutboundOrdersFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  preset: OutboundOrderListPreset;
  onPresetChange: (p: OutboundOrderListPreset) => void;
} & ListScreenToolbarCreateActions;

export function OutboundOrdersFilterToolbar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: OutboundOrdersFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const presetOptions = useMemo(() => PRESET_OPTIONS, []);
  const filtersActive = preset !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã lệnh xuất, đơn bán..."
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={() => onPresetChange('all')}
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
          options={presetOptions}
          onChange={onPresetChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
