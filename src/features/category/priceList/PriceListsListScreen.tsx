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
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { deletePriceList } from '@services/category/priceListAPI';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { fetchCategoryPriceLists } from '@services/category/categoryPriceListSlice';
import {
  PriceListsFilterToolbar,
  type PriceListDefaultFilterKey,
  type PriceListStatusFilterKey} from './components/PriceListsFilterToolbar';
import { PriceListMobileCard } from './components/PriceListMobileCard';
import { PriceListsTable } from './components/PriceListsTable';
import { priceListApiToRow } from '@mappers/category/priceListMappers';
import type { PriceListRow } from './priceListTypes';

export type PriceListsListScreenProps = {
  onOpenDrawer: () => void;
  onCreatePriceList?: () => void;
  onOpenPriceList?: (priceListId: number) => void;
  onEditPriceList?: (priceListId: number) => void;
};

export function PriceListsListScreen({
  onOpenDrawer,
  onCreatePriceList,
  onOpenPriceList,
  onEditPriceList}: PriceListsListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PriceListsListScreen_styles);
  const useTable = useListTableLayout();

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    items: rawItems,
    meta,
    loading,
    refreshing,
    error,
    loadingMore,
    windowStart} = useAppSelector(s => s.categoryPriceList);

  const [query, setQuery] = useState('');
  const [statusKey, setStatusKey] = useState<PriceListStatusFilterKey>('all');
  const [defaultKey, setDefaultKey] =
    useState<PriceListDefaultFilterKey>('all');

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    void dispatch(fetchCategoryPriceLists({ page: 1 }));
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    void dispatch(fetchCategoryPriceLists({ page: 1 }));
  }, [dispatch]);

  const mappedRows = useMemo(() => rawItems.map(priceListApiToRow), [rawItems]);

  const displayRows = useMemo(() => {
    let rows = mappedRows;
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      rows = rows.filter(
        row =>
          row.code.toLowerCase().includes(q) ||
          row.name.toLowerCase().includes(q),
      );
    }
    if (statusKey === 'active') {
      rows = rows.filter(row => row.status === 'active');
    }
    if (statusKey === 'inactive') {
      rows = rows.filter(row => row.status === 'inactive');
    }
    if (defaultKey === 'default') {
      rows = rows.filter(row => row.isDefault);
    }
    if (defaultKey === 'non_default') {
      rows = rows.filter(row => !row.isDefault);
    }
    return rows;
  }, [mappedRows, query, statusKey, defaultKey]);

  const nActive = useMemo(
    () => mappedRows.filter(r => r.status === 'active').length,
    [mappedRows],
  );
  const nInactive = useMemo(
    () => mappedRows.filter(r => r.status === 'inactive').length,
    [mappedRows],
  );

  const listFilterActive = statusKey !== 'all' || defaultKey !== 'all';

  const clearFilters = useCallback(() => {
    setStatusKey('all');
    setDefaultKey('all');
  }, []);

  const itemCount = meta?.total ?? 0;
  const page = meta?.current_page ?? 1;
  const lastPage = Math.max(1, meta?.last_page ?? 1);

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loading || refreshing || loadingMore || page >= lastPage) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(fetchCategoryPriceLists({ page: page + 1, append: true }));
  }, [loading, refreshing, loadingMore, page, lastPage, dispatch]);

  const onViewRow = useCallback(
    (row: PriceListRow) => {
      if (onOpenPriceList) {
        onOpenPriceList(row.id);
        return;
      }
      toast.info(`Mã: ${row.code}\nLoại tiền: ${row.currencyCode}`);
    },
    [onOpenPriceList],
  );

  const confirmDeletePriceList = useCallback(
    async (row: PriceListRow) => {
      const ok = await confirmDialog({
        title: 'Xóa bảng giá',
        message: `Xóa ${row.name}? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        destructive: true,
      });
      if (!ok) {
        return;
      }
      try {
        await deletePriceList(row.id);
        toast.success(`Đã xóa bảng giá ${row.name}.`);
        void dispatch(fetchCategoryPriceLists({ page: 1 }));
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      }
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item }: { item: PriceListRow }) => (
      <PriceListMobileCard row={item} onView={() => onViewRow(item)} />
    ),
    [onViewRow],
  );

  const keyExtractor = useCallback(
    (_item: PriceListRow, index: number) => String(windowStart + index),
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
          <PriceListsFilterToolbar
            filtersActive={listFilterActive}
            onClearFilters={clearFilters}
            query={query}
            onQueryChange={setQuery}
            statusKey={statusKey}
            onStatusChange={setStatusKey}
            defaultKey={defaultKey}
            onDefaultChange={setDefaultKey}
            onRefresh={onRefresh}
            refreshing={refreshing}
            primaryActionTitle={onCreatePriceList != null ? '+ Tạo bảng giá' : undefined}
            onPrimaryAction={onCreatePriceList ?? undefined}
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
      clearFilters,
      query,
      statusKey,
      defaultKey,
      onRefresh,
      refreshing,
      onCreatePriceList,
      itemCount,
      palette,
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
      <PriceListsTable
        rows={displayRows}
        onView={onViewRow}
        onEdit={
          onEditPriceList != null
            ? row => onEditPriceList(row.id)
            : undefined
        }
        onDelete={row => void confirmDeletePriceList(row)}
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
    </View>
  );
}

function create_PriceListsListScreen_styles(c: AppColorPalette) {
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
  });
}
