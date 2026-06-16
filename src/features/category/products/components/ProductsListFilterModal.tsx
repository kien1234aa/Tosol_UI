import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';
import type {
  ProductListKindFilter,
  ProductListStatusFilter,
  ProductListStockFilter,
} from '@services/category/productAPI';

const STATUS_OPTIONS: { key: ProductListStatusFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'inactive', label: 'Không hoạt động' },
];

const STOCK_OPTIONS: { key: ProductListStockFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả tồn' },
  { key: 'low_stock', label: 'Sắp hết hàng' },
  { key: 'out_of_stock', label: 'Hết hàng' },
];

const KIND_OPTIONS: { key: ProductListKindFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả loại' },
  { key: 'combo', label: 'Chỉ combo' },
  { key: 'simple', label: 'Chỉ sản phẩm thường' },
];

export type ProductsListFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  statusFilter: ProductListStatusFilter;
  onStatusFilterChange: (key: ProductListStatusFilter) => void;
  stockFilter: ProductListStockFilter;
  onStockFilterChange: (key: ProductListStockFilter) => void;
  kindFilter: ProductListKindFilter;
  onKindFilterChange: (key: ProductListKindFilter) => void;
};

export function ProductsListFilterModal({
  visible,
  onClose,
  statusFilter,
  onStatusFilterChange,
  stockFilter,
  onStockFilterChange,
  kindFilter,
  onKindFilterChange,
}: ProductsListFilterModalProps) {
  const { t } = useTranslation();

  return (
    <ListScreenFiltersBottomSheet
      visible={visible}
      onClose={onClose}
      title={t('common.listToolbar.filter')}
    >
      <ListScreenFilterPickerSection
        title="Trạng thái"
        value={statusFilter}
        options={STATUS_OPTIONS}
        onChange={onStatusFilterChange}
      />
      <ListScreenFilterPickerSection
        title="Tồn kho"
        value={stockFilter}
        options={STOCK_OPTIONS}
        onChange={onStockFilterChange}
      />
      <ListScreenFilterPickerSection
        title="Loại sản phẩm"
        value={kindFilter}
        options={KIND_OPTIONS}
        onChange={onKindFilterChange}
      />
    </ListScreenFiltersBottomSheet>
  );
}
