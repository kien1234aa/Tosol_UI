import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View } from 'react-native';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { CanvasListSection, CanvasListToolbarShell } from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  applyCategoryProductListPreset,
  clearCategoryProductListScope,
  fetchCategoryProductsList,
  fetchCategoryProductStats,
  setCategoryProductListFilters} from '@services/category/categoryProductSlice';
import {
  deleteProduct,
  type ProductListKindFilter,
  type ProductListStatPreset,
  type ProductListStatusFilter,
  type ProductListStockFilter} from '@services/category/productAPI';
import { ProductsFilterToolbar } from './components/ProductsFilterToolbar';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { ProductDeleteConfirmModal } from './components/ProductDeleteConfirmModal';
import { ProductListMobileCard } from './components/ProductListMobileCard';
import { productApiToListRow } from '@mappers/category/productMappers';
import type { ProductListRow } from './productListTypes';

export type ProductsListScreenProps = {
  onOpenDrawer: () => void;
  onCreateProduct?: () => void;
  onOpenProduct?: (productId: number) => void;
};

function matchesStatPreset(
  status: ProductListStatusFilter,
  stock: ProductListStockFilter,
  kind: ProductListKindFilter,
  preset: ProductListStatPreset,
): boolean {
  if (kind !== 'all') {
    return false;
  }
  if (preset === 'all') {
    return status === 'all' && stock === 'all';
  }
  if (preset === 'active') {
    return status === 'active' && stock === 'all';
  }
  if (preset === 'low_stock') {
    return status === 'all' && stock === 'low_stock';
  }
  return status === 'all' && stock === 'out_of_stock';
}

export function ProductsListScreen({
  onOpenDrawer,
  onCreateProduct,
  onOpenProduct}: ProductsListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ProductsListScreen_styles);

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    items: rawItems,
    meta,
    loading,
    refreshing,
    error,
    listStatusFilter,
    listStockFilter,
    listKindFilter,
    stats,
    statsLoading,
    loadingMore,
    windowStart} = useAppSelector(s => s.categoryProduct);

  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProductListRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    void dispatch(fetchCategoryProductStats());
  }, [dispatch]);

  useEffect(() => {
    void dispatch(fetchCategoryProductsList({ page: 1 }));
  }, [dispatch, listStatusFilter, listStockFilter, listKindFilter]);

  const onRefresh = useCallback(() => {
    void dispatch(fetchCategoryProductStats());
    void dispatch(fetchCategoryProductsList({ page: 1 }));
  }, [dispatch]);

  const mappedRows = useMemo(
    () => rawItems.map(productApiToListRow),
    [rawItems],
  );

  const displayRows = useMemo(() => {
    let rows = mappedRows;
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      rows = rows.filter(
        row =>
          row.sku.toLowerCase().includes(q) ||
          row.name.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [mappedRows, query]);

  const listFilterActive =
    listStatusFilter !== 'all' ||
    listStockFilter !== 'all' ||
    listKindFilter !== 'all';

  const clearListFilters = useCallback(() => {
    dispatch(clearCategoryProductListScope());
    setQuery('');
  }, [dispatch]);

  const confirmDeleteProduct = useCallback(async () => {
    if (deleteTarget == null) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`Đã xóa sản phẩm ${deleteTarget.name}.`);
      void dispatch(fetchCategoryProductsList({ page: 1 }));
      void dispatch(fetchCategoryProductStats());
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, dispatch]);

  const toggleStatPreset = useCallback(
    (next: ProductListStatPreset, same: boolean) => {
      if (same) {
        dispatch(clearCategoryProductListScope());
      } else {
        dispatch(applyCategoryProductListPreset(next));
      }
    },
    [dispatch],
  );

  const itemCount = meta?.total ?? 0;
  const page = meta?.current_page ?? 1;
  const lastPage = Math.max(1, meta?.last_page ?? 1);

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loading || refreshing || loadingMore || page >= lastPage) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(fetchCategoryProductsList({ page: page + 1, append: true }));
  }, [loading, refreshing, loadingMore, page, lastPage, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: ProductListRow }) => (
      <ProductListMobileCard
        row={item}
        onView={
          onOpenProduct != null
            ? () => onOpenProduct(item.id)
            : undefined
        }
        onDelete={() => setDeleteTarget(item)}
      />
    ),
    [onOpenProduct],
  );

  const keyExtractor = useCallback(
    (_item: ProductListRow, index: number) => String(windowStart + index),
    [windowStart],
  );

  const listHeader = useMemo(
    () => (
      <>
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <CanvasListToolbarShell>
          <ProductsFilterToolbar
            query={query}
            onQueryChange={setQuery}
            statusFilter={listStatusFilter}
            onStatusFilterChange={status =>
              void dispatch(setCategoryProductListFilters({ status }))
            }
            stockFilter={listStockFilter}
            onStockFilterChange={stock =>
              void dispatch(setCategoryProductListFilters({ stock }))
            }
            kindFilter={listKindFilter}
            onKindFilterChange={kind =>
              void dispatch(setCategoryProductListFilters({ kind }))
            }
            filtersActive={listFilterActive}
            onClearFilters={clearListFilters}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onCreateProduct={onCreateProduct}
          />
        </CanvasListToolbarShell>
        <CanvasListSection>
          <View style={styles.listHeaderRow}>
            <SectionTitle label="Danh sách" />
            <Text
              style={[styles.listMeta, { color: palette.textMuted }]}
              numberOfLines={2}
            >
              {itemCount.toLocaleString('vi-VN')} mục
            </Text>
          </View>
        </CanvasListSection>
      </>
    ),
    [
      error,
      styles,
      query,
      listStatusFilter,
      listStockFilter,
      listKindFilter,
      listFilterActive,
      clearListFilters,
      onRefresh,
      refreshing,
      onCreateProduct,
      itemCount,
      palette,
      dispatch,
    ],
  );

  const listFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="small" color={palette.textSecondary} />
          <Text style={styles.loadMoreText}>Đang tải thêm…</Text>
        </View>
      );
    }
    if (displayRows.length > 0 && meta != null && page >= lastPage) {
      return (
        <View style={styles.loadMoreFooter}>
          <Text style={styles.endOfListText}>Hết danh sách</Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, displayRows.length, meta, page, lastPage, styles, palette]);

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [onRefresh, refreshing, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate
        loading={loading}
        refreshing={refreshing}
        itemCount={mappedRows.length}
        withLeading
      >
        <FlatList
          data={displayRows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.scroll}
          contentContainerStyle={[
            canvasListScrollContent(),
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
      </ListLoadingGate>

      <ProductDeleteConfirmModal
        visible={deleteTarget != null}
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={() => {
          void confirmDeleteProduct();
        }}
      />
    </View>
  );
}

function create_ProductsListScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg},
    scroll: { flex: 1 },
    errorText: {
      marginBottom: 10,
      fontSize: 13,
      color: c.red,
      fontWeight: '600'},
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 4},
    listMeta: { fontSize: 11, maxWidth: '55%', textAlign: 'right' },
    loadMoreFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    loadMoreText: {
      fontSize: 13,
      color: c.textMuted,
    },
    endOfListText: {
      fontSize: 12,
      color: c.textMuted,
      textAlign: 'center',
    },
  });
}
