import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import {
  SHOP_LIST_PLATFORM_OPTIONS,
  SHOP_LIST_STATUS_OPTIONS,
  type ShopListStatusFilterKey,
} from '../shopListFilterOptions';

export type SettingsShopsFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  platformKey: string;
  onPlatformKeyChange: (key: string) => void;
  statusFilter: ShopListStatusFilterKey;
  onStatusFilterChange: (key: ShopListStatusFilterKey) => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
} & ListScreenToolbarCreateActions;

export function SettingsShopsFilterToolbar({
  query,
  onQueryChange,
  platformKey,
  onPlatformKeyChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive: filtersActiveProp,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: SettingsShopsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const platformOptions = useMemo(() => SHOP_LIST_PLATFORM_OPTIONS, []);
  const statusOptions = useMemo(() => SHOP_LIST_STATUS_OPTIONS, []);
  const filtersActive =
    filtersActiveProp ?? (statusFilter !== 'all' || platformKey !== '');

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo tên, ID cửa hàng trên sàn..."
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
          title="Sàn"
          value={platformKey}
          options={platformOptions}
          onChange={onPlatformKeyChange}
        />
        <ListScreenFilterPickerSection
          title="Trạng thái"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
