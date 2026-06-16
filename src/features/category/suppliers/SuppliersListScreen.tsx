import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { CanvasListToolbarShell } from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { BRAND_HEX, ON_BRAND } from '@shared/theme/designTokens';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View } from 'react-native';
import { useListTableLayout } from '@shared/hooks/useListTableLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  fetchCategorySuppliers,
  fetchCategorySupplierStats,
  setCategorySupplierListStatusFilter} from '@services/category/categorySupplierSlice';
import type { SupplierListStatusFilter } from '@services/category/categorySupplierSlice';
import { deleteSupplier } from '@services/category/supplierAPI';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { SuppliersFilterToolbar } from './components/SuppliersFilterToolbar';
import { SupplierListMobileCard } from './components/SupplierListMobileCard';
import { SuppliersTable } from './components/SuppliersTable';
import { supplierApiToRow } from '@mappers/category/supplierMappers';
import type { SupplierListRow } from './supplierTypes';

export type SuppliersListScreenProps = {
  onOpenDrawer: () => void;
  onCreateSupplier?: () => void;
  onOpenSupplier?: (supplierId: number) => void;
};

export function SuppliersListScreen({
  onOpenDrawer,
  onCreateSupplier,
  onOpenSupplier}: SuppliersListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_SuppliersListScreen_styles);
  const useTable = useListTableLayout();

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    items: rawItems,
    meta,
    loading,
    refreshing,
    error,
    listStatusFilter,
    stats,
    statsLoading,
    loadingMore,
    windowStart} = useAppSelector(s => s.categorySupplier);

  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SupplierListRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    void dispatch(fetchCategorySupplierStats());
  }, [dispatch]);

  useEffect(() => {
    void dispatch(fetchCategorySuppliers({ page: 1 }));
  }, [dispatch, listStatusFilter]);

  const onRefresh = useCallback(() => {
    void dispatch(fetchCategorySupplierStats());
    void dispatch(fetchCategorySuppliers({ page: 1 }));
  }, [dispatch]);

  const mappedRows = useMemo(() => rawItems.map(supplierApiToRow), [rawItems]);

  const displayRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      return mappedRows;
    }
    return mappedRows.filter(row => {
      const hay =
        `${row.name} ${row.codeLabel} ${row.contactLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [mappedRows, query]);

  const listFilterActive = listStatusFilter !== 'all';

  const clearListFilters = useCallback(() => {
    dispatch(setCategorySupplierListStatusFilter('all'));
  }, [dispatch]);

  const toggleStatFilter = useCallback(
    (next: SupplierListStatusFilter, same: boolean) => {
      if (same) {
        dispatch(setCategorySupplierListStatusFilter('all'));
      } else {
        dispatch(setCategorySupplierListStatusFilter(next));
      }
    },
    [dispatch],
  );

  const confirmDelete = useCallback(async () => {
    if (deleteTarget == null) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteSupplier(deleteTarget.id);
      toast.success(`Đã xóa nhà cung cấp ${deleteTarget.name}.`);
      void dispatch(fetchCategorySuppliers({ page: 1 }));
      void dispatch(fetchCategorySupplierStats());
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, dispatch]);

  const itemCount = meta?.total ?? 0;
  const page = meta?.current_page ?? 1;
  const lastPage = Math.max(1, meta?.last_page ?? 1);

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loading || refreshing || loadingMore || page >= lastPage) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(fetchCategorySuppliers({ page: page + 1, append: true }));
  }, [loading, refreshing, loadingMore, page, lastPage, dispatch]);

  const onViewRow = useCallback(
    (row: SupplierListRow) => {
      if (onOpenSupplier) {
        onOpenSupplier(row.id);
        return;
      }
      toast.info(`Mã: ${row.codeLabel}\nLiên hệ: ${row.contactLabel}`);
    },
    [onOpenSupplier],
  );

  const renderItem = useCallback(
    ({ item }: { item: SupplierListRow }) => (
      <SupplierListMobileCard
        row={item}
        onView={() => onViewRow(item)}
        onDelete={() => setDeleteTarget(item)}
      />
    ),
    [onViewRow],
  );

  const keyExtractor = useCallback(
    (_item: SupplierListRow, index: number) => String(windowStart + index),
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
        {listFilterActive ? (
          <Pressable
            onPress={clearListFilters}
            style={styles.clearFilterBtn}
            hitSlop={6}
          >
            <Text style={styles.clearFilterText}>Bỏ lọc danh sách</Text>
          </Pressable>
        ) : null}
        <CanvasListToolbarShell>
          <SuppliersFilterToolbar
            query={query}
            onQueryChange={setQuery}
            statusKey={listStatusFilter}
            onStatusChange={k => dispatch(setCategorySupplierListStatusFilter(k))}
            onRefresh={onRefresh}
            refreshing={refreshing}
            primaryActionTitle={onCreateSupplier != null ? '+ Tạo NCC' : undefined}
            onPrimaryAction={onCreateSupplier ?? undefined}
          />
        </CanvasListToolbarShell>
        <View style={styles.listHeaderRow}>
          <SectionTitle label="Danh sách" />
          <Text
            style={[styles.listMeta, { color: palette.textMuted }]}
            numberOfLines={2}
          >
            {itemCount.toLocaleString('vi-VN')} mục
          </Text>
        </View>
      </>
    ),
    [
      error,
      styles,
      listFilterActive,
      clearListFilters,
      query,
      listStatusFilter,
      onRefresh,
      refreshing,
      onCreateSupplier,
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

  const listBody = useTable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        canvasListScrollContent(),
        { paddingBottom: insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={memoizedRefreshControl}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        if (
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - 120
        ) {
          handleLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {listHeader}
      <SuppliersTable
        rows={displayRows}
        onView={onViewRow}
        onDelete={row => setDeleteTarget(row)}
      />
      {listFooter}
    </ScrollView>
  ) : (
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
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate
        loading={loading}
        refreshing={refreshing}
        itemCount={mappedRows.length}
        withLeading={false}
        hasDetail
      >
        {listBody}
      </ListLoadingGate>

      {deleteTarget != null ? (
        <View style={styles.deleteOverlay} pointerEvents="box-none">
          <Pressable
            style={styles.deleteBackdrop}
            onPress={() => !deleteLoading && setDeleteTarget(null)}
          />
          <View style={styles.deleteCard}>
            <Text style={styles.deleteTitle}>Xóa nhà cung cấp</Text>
            <Text style={styles.deleteMsg}>
              Xóa {deleteTarget.name}? Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.deleteActions}>
              <Pressable
                onPress={() => !deleteLoading && setDeleteTarget(null)}
                disabled={deleteLoading}
                style={styles.deleteGhost}
              >
                <Text style={styles.deleteGhostTxt}>Hủy</Text>
              </Pressable>
              <Pressable
                onPress={() => void confirmDelete()}
                disabled={deleteLoading}
                style={styles.deleteDanger}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.deleteDangerTxt}>Xóa</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function create_SuppliersListScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg},
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 12},
    toolbarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8},
    spacer: { flex: 1 },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center'},
    createBtn: {
      backgroundColor: BRAND_HEX,
      borderColor: BRAND_HEX},
    createBtnText: {
      color: ON_BRAND,
      fontWeight: '700'},
    clearFilterBtn: {
      alignSelf: 'flex-start',
      marginBottom: 10,
      paddingVertical: 6,
      paddingHorizontal: 10},
    clearFilterText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textLink},
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
      marginBottom: 4,
      marginTop: 8},
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
    deleteOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      zIndex: 60},
    deleteBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)'},
    deleteCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 14,
      padding: 18,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border},
    deleteTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 8},
    deleteMsg: {
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 20,
      marginBottom: 18},
    deleteActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12},
    deleteGhost: {
      paddingVertical: 10,
      paddingHorizontal: 16},
    deleteGhostTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary},
    deleteDanger: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: c.red,
      minWidth: 88,
      alignItems: 'center'},
    deleteDangerTxt: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff'}});
}
