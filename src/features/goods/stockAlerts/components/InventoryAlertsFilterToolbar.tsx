import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type { InventoryAlertTypeFilter } from '@services/warehouse/inventoryAlertsAPI';

const ALERT_OPTIONS: { key: InventoryAlertTypeFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả loại' },
  { key: 'out_of_stock', label: 'Hết hàng' },
  { key: 'low_stock', label: 'Sắp hết hàng' },
  { key: 'near_expiry', label: 'Sắp hết hạn' },
];

export type WarehouseFilterOption = { id: number | 'all'; label: string };

export type InventoryAlertsFilterToolbarProps = {
  alertType: InventoryAlertTypeFilter;
  onAlertTypeChange: (v: InventoryAlertTypeFilter) => void;
  warehouseFilter: number | 'all';
  onWarehouseFilterChange: (v: number | 'all') => void;
  warehouseOptions: WarehouseFilterOption[];
  listLoading: boolean;
  onRefreshPress: () => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
};

export function InventoryAlertsFilterToolbar({
  alertType,
  onAlertTypeChange,
  warehouseFilter,
  onWarehouseFilterChange,
  warehouseOptions,
  listLoading,
  onRefreshPress,
  filtersActive = false,
  onClearFilters,
}: InventoryAlertsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  const whSheetOptions = useMemo(
    () =>
      warehouseOptions.map(o => ({
        key: o.id === 'all' ? 'all' : String(o.id),
        label: o.label,
      })),
    [warehouseOptions],
  );

  const whKey = warehouseFilter === 'all' ? 'all' : String(warehouseFilter);
  const alertOptions = useMemo(() => ALERT_OPTIONS, []);

  return (
    <>
      <ListScreenSearchToolbar
        showSearch={false}
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        onRefresh={onRefreshPress}
        refreshing={listLoading}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Loại cảnh báo"
          value={alertType}
          options={alertOptions}
          onChange={onAlertTypeChange}
        />
        <ListScreenFilterPickerSection
          title="Kho hàng"
          value={whKey}
          options={whSheetOptions}
          onChange={k => {
            if (k === 'all') {
              onWarehouseFilterChange('all');
            } else {
              const n = Number(k);
              onWarehouseFilterChange(Number.isFinite(n) ? n : 'all');
            }
          }}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
