import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

export type WarehouseFilterOption = { id: number | 'all'; label: string };

export type InventoryFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  warehouseFilter?: number | 'all';
  onWarehouseFilterChange?: (v: number | 'all') => void;
  warehouseOptions?: WarehouseFilterOption[];
};

export function InventoryFilterToolbar({
  query,
  onQueryChange,
  warehouseFilter,
  onWarehouseFilterChange,
  warehouseOptions,
}: InventoryFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  const showWh =
    warehouseOptions != null &&
    warehouseOptions.length > 0 &&
    onWarehouseFilterChange != null &&
    warehouseFilter !== undefined;

  const whSheetOptions = useMemo(
    () =>
      (warehouseOptions ?? []).map(o => ({
        key: o.id === 'all' ? 'all' : String(o.id),
        label: o.label,
      })),
    [warehouseOptions],
  );

  const whKey =
    warehouseFilter === 'all' || warehouseFilter === undefined
      ? 'all'
      : String(warehouseFilter);

  const filtersActive = showWh && whKey !== 'all';

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo SKU hoặc tên sản phẩm"
        onFilterPress={showWh ? () => setFilterOpen(true) : undefined}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={
          showWh ? () => onWarehouseFilterChange?.('all') : undefined
        }
      />
      {showWh ? (
        <ListScreenFiltersBottomSheet
          visible={filterOpen}
          onClose={() => setFilterOpen(false)}
        >
          <ListScreenFilterPickerSection
            title="Kho hàng"
            value={whKey}
            options={whSheetOptions}
            onChange={k => {
              if (k === 'all') {
                onWarehouseFilterChange?.('all');
              } else {
                const n = Number(k);
                onWarehouseFilterChange?.(Number.isFinite(n) ? n : 'all');
              }
            }}
          />
        </ListScreenFiltersBottomSheet>
      ) : null}
    </>
  );
}
