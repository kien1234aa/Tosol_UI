import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import type {
  ProductListKindFilter,
  ProductListStatusFilter,
  ProductListStockFilter,
} from '@services/category/productAPI';
import { ProductsListFilterModal } from './ProductsListFilterModal';

export type ProductsFilterToolbarProps = {
  searchPlaceholder?: string;
  query: string;
  onQueryChange: (q: string) => void;
  statusFilter: ProductListStatusFilter;
  onStatusFilterChange: (key: ProductListStatusFilter) => void;
  stockFilter: ProductListStockFilter;
  onStockFilterChange: (key: ProductListStockFilter) => void;
  kindFilter: ProductListKindFilter;
  onKindFilterChange: (key: ProductListKindFilter) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onCreateProduct?: () => void;
};

export function ProductsFilterToolbar({
  searchPlaceholder = 'Tìm theo SKU, tên...',
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  stockFilter,
  onStockFilterChange,
  kindFilter,
  onKindFilterChange,
  filtersActive,
  onClearFilters,
  onRefresh,
  refreshing = false,
  onCreateProduct,
}: ProductsFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder={searchPlaceholder}
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        onRefresh={onRefresh}
        refreshing={refreshing}
        primaryActionTitle={
          onCreateProduct != null ? '+ Tạo sản phẩm' : undefined
        }
        onPrimaryAction={onCreateProduct}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
      />
      <ProductsListFilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        stockFilter={stockFilter}
        onStockFilterChange={onStockFilterChange}
        kindFilter={kindFilter}
        onKindFilterChange={onKindFilterChange}
      />
    </>
  );
}
