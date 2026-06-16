import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import {
  PURCHASE_PARTNER_FILTER_OPTIONS,
  type PurchasePartnerListFilter,
} from '../purchasePartnerFilters';

export type PurchaseOrderListPreset =
  | 'all'
  | 'confirmed'
  | 'partial'
  | 'received'
  | 'cancelled';

export type PurchaseOrderSupplierOption = { id: number; name: string };

const STATUS_OPTIONS: { key: PurchaseOrderListPreset; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'partial', label: 'Đã nhận một phần' },
  { key: 'received', label: 'Đã nhận đủ' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export type PurchaseOrderFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  preset: PurchaseOrderListPreset;
  onPresetChange: (p: PurchaseOrderListPreset) => void;
  partnerFilter: PurchasePartnerListFilter;
  onPartnerFilterChange: (v: PurchasePartnerListFilter) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
} & ListScreenToolbarCreateActions;

export function PurchaseOrderFilterToolbar({
  query,
  onQueryChange,
  preset,
  onPresetChange,
  partnerFilter,
  onPartnerFilterChange,
  filtersActive,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: PurchaseOrderFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);
  const partnerOptions = useMemo(() => PURCHASE_PARTNER_FILTER_OPTIONS, []);

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo mã đơn, mã vận đơn..."
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
        <ListScreenFilterPickerSection
          title="Nhận hàng hoàn trả & NCC"
          value={partnerFilter}
          options={partnerOptions}
          onChange={onPartnerFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
