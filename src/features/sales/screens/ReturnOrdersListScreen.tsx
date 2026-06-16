import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { CanvasListToolbarShell } from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { LIST_CARD } from '@shared/theme/designTokens';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../components/SalesScreenHeader';
import { OrdersSearchToolbar } from '../orders/components/OrdersSearchToolbar';
import { ReturnOrderListMobileCard } from '../returnOrders/components/ReturnOrderListMobileCard';
import { ReturnOrdersAdvancedFilterModal } from '../returnOrders/components/ReturnOrdersAdvancedFilterModal';
import { returnOrderToListRow } from '@mappers/sales/returnOrderMappers';
import type { ReturnOrderListRow } from '../returnOrders/returnOrderListTypes';
import type { ReturnOrderListFilters } from '@services/sales/returnOrderAPI';
import {
  clearReturnOrderListFilters,
  fetchReturnOrderCounts,
  fetchReturnOrders,
  setReturnOrderListFilters} from '@services/sales/returnOrderSlice';

export type ReturnOrdersListScreenProps = {
  onOpenDrawer: () => void;
  onOpenOrder?: (orderNumber: string) => void;
};

function hasListFilters(f: ReturnOrderListFilters) {
  return Boolean(
    f.filterStatus?.trim() ||
      f.filterReturnType?.trim() ||
      f.filterReason?.trim() ||
      f.filterRefundStatus?.trim() ||
      f.filterDateFrom?.trim() ||
      f.filterDateTo?.trim() ||
      f.filterSearch?.trim(),
  );
}

export function ReturnOrdersListScreen({
  onOpenDrawer,
  onOpenOrder}: ReturnOrdersListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ReturnOrdersListScreen_styles);

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { items, meta, loading, refreshing, loadingMore, error, listFilters, windowStart } =
    useAppSelector(s => s.returnOrder);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => listFilters.filterSearch?.trim() ?? '',
  );
  const listFiltersRef = useRef(listFilters);
  listFiltersRef.current = listFilters;

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchQuery.trim() || undefined;
      const cur = listFiltersRef.current.filterSearch?.trim() || undefined;
      if (next === cur) {
        return;
      }
      dispatch(
        setReturnOrderListFilters({
          ...listFiltersRef.current,
          filterSearch: next,
        }),
      );
      dispatch(fetchReturnOrders({ page: 1 }));
    }, 450);
    return () => clearTimeout(id);
  }, [searchQuery, dispatch]);

  const refreshList = useCallback(() => {
    dispatch(fetchReturnOrders({ page: 1 }));
    dispatch(fetchReturnOrderCounts());
  }, [dispatch]);

  const fetchFirstPage = useCallback(() => {
    dispatch(fetchReturnOrders({ page: 1 }));
    dispatch(fetchReturnOrderCounts());
  }, [dispatch]);

  const toggleListFilter = useCallback(
    (next: ReturnOrderListFilters, same: boolean) => {
      if (same) {
        setSearchQuery('');
        dispatch(clearReturnOrderListFilters());
      } else {
        dispatch(setReturnOrderListFilters({ ...listFilters, ...next }));
      }
      dispatch(fetchReturnOrders({ page: 1 }));
    },
    [dispatch, listFilters],
  );

  const clearListFilters = useCallback(() => {
    setSearchQuery('');
    dispatch(clearReturnOrderListFilters());
    dispatch(fetchReturnOrders({ page: 1 }));
    dispatch(fetchReturnOrderCounts());
  }, [dispatch]);

  const applyAdvancedFilters = useCallback(
    (next: ReturnOrderListFilters) => {
      dispatch(
        setReturnOrderListFilters({
          ...next,
          filterSearch: listFiltersRef.current.filterSearch,
        }),
      );
      dispatch(fetchReturnOrders({ page: 1 }));
      dispatch(fetchReturnOrderCounts());
    },
    [dispatch],
  );

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  const rows = useMemo(() => items.map(returnOrderToListRow), [items]);
  const itemCount = meta?.total ?? rows.length;
  const listFilterActive = hasListFilters(listFilters);

  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const canLoadMore = currentPage < lastPage;

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loadingMore || loading || !canLoadMore) {
      return;
    }
    pendingLoadMoreRef.current = true;
    dispatch(fetchReturnOrders({ page: currentPage + 1, append: true }));
  }, [loadingMore, loading, canLoadMore, currentPage, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: ReturnOrderListRow }) => (
      <ReturnOrderListMobileCard
        row={item}
        onPress={
          onOpenOrder != null &&
          item.originOrderNumber &&
          item.originOrderNumber !== '—'
            ? () => onOpenOrder(item.originOrderNumber!)
            : undefined
        }
      />
    ),
    [onOpenOrder],
  );

  const keyExtractor = useCallback((item: ReturnOrderListRow) => item.key, []);

  const ListHeader = useMemo(
    () => (
      <View>
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
          <OrdersSearchToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm theo mã đơn, mã vận đơn…"
            onAdvancedFilter={() => setAdvancedOpen(true)}
            onRefresh={refreshList}
            refreshing={refreshing}
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
      </View>
    ),
    [error, listFilterActive, searchQuery, refreshing, itemCount, palette.textMuted, styles, clearListFilters, refreshList],
  );

  const ListFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="large" color={palette.textLink} />
          <Text style={[styles.loadMoreText, { color: palette.textMuted }]}>
            Đang tải thêm…
          </Text>
        </View>
      );
    }
    if (rows.length > 0 && !canLoadMore) {
      const windowEnd = windowStart + rows.length;
      const total = meta?.total ?? windowEnd;
      const windowLabel =
        windowStart > 0
          ? `Hiển thị ${windowStart + 1}–${windowEnd} / ${total}`
          : 'Đã hiển thị tất cả';
      return (
        <View style={styles.loadMoreFooter}>
          <Text style={[styles.endOfListText, { color: palette.textMuted }]}>
            {windowLabel}
          </Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, canLoadMore, rows.length, windowStart, meta, palette, styles]);

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={refreshList}
        tintColor={palette.textSecondary}
      />
    ),
    [refreshList, refreshing, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <ReturnOrdersAdvancedFilterModal
        visible={advancedOpen}
        appliedFilters={listFilters}
        onClose={() => setAdvancedOpen(false)}
        onApply={applyAdvancedFilters}
      />
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate loading={loading} refreshing={refreshing} itemCount={rows.length}>
        <FlatList<ReturnOrderListRow>
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.scroll}
          contentContainerStyle={[
            canvasListScrollContent(),
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
      </ListLoadingGate>
    </View>
  );
}

function create_ReturnOrdersListScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg},
    scroll: { flex: 1 },
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
    cardList: { gap: LIST_CARD.listGap, marginTop: 4 },
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 4},
    listMeta: { fontSize: 11, maxWidth: '55%', textAlign: 'right' },
    loadMoreFooter: {
      paddingVertical: 24,
      alignItems: 'center',
      gap: 8},
    loadMoreText: { fontSize: 13 },
    endOfListText: { fontSize: 12 }});
}
