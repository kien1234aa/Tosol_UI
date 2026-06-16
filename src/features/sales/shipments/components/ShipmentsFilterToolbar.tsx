import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type {
  ShipmentListFilters,
  ShipmentPartnerFilterOption,
} from '@services/sales/shipmentAPI';
import { SHIPMENT_STATUS_FILTER_OPTIONS } from '@services/sales/shipmentAPI';

export type ShipmentsFilterToolbarProps = {
  searchValue: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
  listFilters: ShipmentListFilters;
  partnerOptions: ShipmentPartnerFilterOption[];
  partnersLoading?: boolean;
  onChangeStatus: (status: string | undefined) => void;
  onChangePartner: (partnerCode: string | undefined) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
};

function parsePartnerCodeFromSheetValue(v: string): string | undefined {
  const t = v.trim();
  if (!t) {
    return undefined;
  }
  if (t.startsWith('code:')) {
    const c = t.slice(5).trim().toLowerCase();
    return c || undefined;
  }
  return undefined;
}

export function ShipmentsFilterToolbar({
  searchValue,
  onSearchChange,
  onRefresh,
  refreshing = false,
  listFilters,
  partnerOptions,
  onChangeStatus,
  onChangePartner,
  filtersActive,
  onClearFilters,
}: ShipmentsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  const statusKey = listFilters.filterStatus?.trim() ?? '';
  const statusOptions = useMemo(
    () =>
      SHIPMENT_STATUS_FILTER_OPTIONS.map(o => ({
        key: o.value,
        label: o.label,
      })),
    [],
  );

  const partnerCode =
    listFilters.filterShippingPartnerCode?.trim().toLowerCase() ?? '';

  const partnerOptionsForPicker = useMemo(() => {
    const base = [{ key: '', label: 'Tất cả đối tác' }];
    return base.concat(
      partnerOptions.map(p => ({ key: p.key, label: p.label })),
    );
  }, [partnerOptions]);

  const partnerSelectedKey = useMemo(() => {
    if (!partnerCode) {
      return '';
    }
    const hit = partnerOptions.find(
      o => o.partnerCode.toLowerCase() === partnerCode,
    );
    return hit?.key ?? `code:${partnerCode}`;
  }, [partnerCode, partnerOptions]);

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm theo mã vận đơn, SĐT người nhận…"
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        onRefresh={onRefresh}
        refreshing={refreshing}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Trạng thái vận đơn"
          value={statusKey}
          options={statusOptions}
          onChange={k => onChangeStatus(k.trim() ? k : undefined)}
        />
        <ListScreenFilterPickerSection
          title="Đối tác vận chuyển"
          value={partnerSelectedKey}
          options={partnerOptionsForPicker}
          onChange={k => {
            if (!k.trim()) {
              onChangePartner(undefined);
              return;
            }
            onChangePartner(parsePartnerCodeFromSheetValue(k));
          }}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
