import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type { InvoiceListFilter } from '../invoiceListTypes';

/** Thứ tự hiển thị theo nghiệp vụ — map `partial` → `partially_paid` ở `invoiceListFilterToApiStatus`. */
const STATUS_OPTIONS: { key: InvoiceListFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'draft', label: 'Nháp' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'partial', label: 'Thanh toán một phần' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'overdue', label: 'Quá hạn' },
];

export type InvoiceFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  filter: InvoiceListFilter;
  onFilterChange: (f: InvoiceListFilter) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
};

export function InvoiceFilterToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  filtersActive,
  onClearFilters,
}: InvoiceFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm theo số hóa đơn..."
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Trạng thái"
          value={filter}
          options={statusOptions}
          onChange={onFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
