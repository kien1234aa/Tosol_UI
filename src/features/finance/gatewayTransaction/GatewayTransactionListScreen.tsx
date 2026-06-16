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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View } from 'react-native';
import { useListTableLayout } from '@shared/hooks/useListTableLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  clearGatewayTxnListFilter,
  fetchGatewayTransactions,
  fetchGatewayTxnCounts,
  setGatewayTxnListExtraFilters,
  setGatewayTxnListFilter,
  setGatewayTxnListSearch} from '@services/finance/gatewayTransactionSlice';
import { GatewayTransactionFilterToolbar } from './components/GatewayTransactionFilterToolbar';
import { GatewayTransactionsAdvancedFilterModal } from './components/GatewayTransactionsAdvancedFilterModal';
import { GatewayTxnListMobileCard } from './components/GatewayTxnListMobileCard';
import { GatewayTransactionsTable } from './components/GatewayTransactionsTable';
import { gatewayTxnListItemToRow } from '@mappers/finance/gatewayTransactionListMappers';

export type GatewayTransactionListScreenProps = {
  onOpenDrawer: () => void;
  onOpenPayment?: (paymentRef: string) => void;
};

export function GatewayTransactionListScreen({
  onOpenDrawer,
  onOpenPayment}: GatewayTransactionListScreenProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_GatewayTransactionListScreen_styles);
  const useTable = useListTableLayout();
  const dispatch = useAppDispatch();
  const {
    items,
    meta,
    loading,
    refreshing,
    loadingMore,
    windowStart,
    error,
    listFilter,
    listSearch,
    listSellerId,
    listTypeFilter,
    listDateFrom,
    listDateTo,
    } = useAppSelector(s => s.gatewayTransaction);

  const [query, setQuery] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = query.trim();
      if (next !== listSearch) {
        dispatch(setGatewayTxnListSearch(next));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, listSearch, dispatch]);

  useEffect(() => {
    void dispatch(fetchGatewayTransactions({ page: 1 }));
  }, [
    dispatch,
    listFilter,
    listSearch,
    listSellerId,
    listTypeFilter,
    listDateFrom,
    listDateTo,
  ]);

  useEffect(() => {
    void dispatch(fetchGatewayTxnCounts());
  }, [dispatch, listSellerId, listTypeFilter, listDateFrom, listDateTo]);

  const rows = useMemo(() => items.map(gatewayTxnListItemToRow), [items]);
  const itemCount = meta?.total ?? rows.length;

  const currentPage = meta?.current_page ?? 1;
  const lastPage = Math.max(1, meta?.last_page ?? 1);
  const canLoadMore = currentPage < lastPage && !loading && !refreshing && !loadingMore;

  const refreshList = useCallback(() => {
    void dispatch(fetchGatewayTransactions({ page: 1 }));
    void dispatch(fetchGatewayTxnCounts());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    refreshList();
  }, [refreshList]);

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || !canLoadMore) return;
    pendingLoadMoreRef.current = true;
    void dispatch(fetchGatewayTransactions({ page: currentPage + 1, append: true }));
  }, [canLoadMore, currentPage, dispatch]);

  const listFilterActive =
    listFilter !== 'all' ||
    listSearch.trim().length > 0 ||
    listSellerId.trim().length > 0 ||
    listTypeFilter !== 'all' ||
    listDateFrom.trim().length > 0 ||
    listDateTo.trim().length > 0;

  const clearListFilters = useCallback(() => {
    dispatch(clearGatewayTxnListFilter());
    dispatch(setGatewayTxnListSearch(''));
    setQuery('');
  }, [dispatch]);

  type RowItem = ReturnType<typeof gatewayTxnListItemToRow>;

  const keyExtractor = useCallback((item: RowItem) => item.id, []);

  const onOpenRow = useCallback(
    (row: RowItem) => {
      onOpenPayment?.(row.detailRef);
    },
    [onOpenPayment],
  );

  const renderItem = useCallback(
    ({ item }: { item: RowItem }) => (
      <GatewayTxnListMobileCard
        row={item}
        onPress={onOpenPayment != null ? () => onOpenRow(item) : undefined}
      />
    ),
    [onOpenPayment, onOpenRow],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <CanvasListToolbarShell>
          <GatewayTransactionFilterToolbar
            query={query}
            onQueryChange={setQuery}
            filtersActive={listFilterActive}
            onClearFilters={clearListFilters}
            onOpenAdvanced={() => setAdvancedOpen(true)}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [error, styles, palette, query, listFilterActive, clearListFilters, itemCount],
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.loadMoreFooter}>
        {loadingMore ? (
          <>
            <ActivityIndicator size="large" color={palette.textLink} />
            <Text style={[styles.loadMoreText, { color: palette.textSecondary }]}>
              Đang tải thêm…
            </Text>
          </>
        ) : rows.length > 0 ? (
          windowStart > 0 ? (
            <Text style={[styles.endOfListText, { color: palette.textMuted }]}>
              Hiển thị {(windowStart + 1).toLocaleString('vi-VN')}–
              {(windowStart + rows.length).toLocaleString('vi-VN')} /{' '}
              {itemCount.toLocaleString('vi-VN')}
            </Text>
          ) : (
            <Text style={[styles.endOfListText, { color: palette.textMuted }]}>
              Đã hiển thị tất cả
            </Text>
          )
        ) : null}
      </View>
    ),
    [loadingMore, rows.length, windowStart, itemCount, styles, palette],
  );

  // suppress unused variable warnings for tap handlers kept for filter toolbar
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
      <GatewayTransactionsAdvancedFilterModal
        visible={advancedOpen}
        statusFilter={listFilter}
        sellerId={listSellerId}
        typeFilter={listTypeFilter}
        dateFrom={listDateFrom}
        dateTo={listDateTo}
        onClose={() => setAdvancedOpen(false)}
        onApply={({ status, sellerId, type, dateFrom, dateTo }) => {
          dispatch(setGatewayTxnListFilter(status));
          dispatch(
            setGatewayTxnListExtraFilters({
              sellerId,
              typeFilter: type,
              dateFrom,
              dateTo}),
          );
        }}
      />
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate loading={loading} refreshing={refreshing} itemCount={rows.length}>
        {useTable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              canvasListScrollContent(),
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={memoizedRefreshControl}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } =
                nativeEvent;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 120
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {ListHeader}
            <GatewayTransactionsTable
              rows={rows}
              onRowPress={onOpenPayment != null ? onOpenRow : undefined}
            />
            {ListFooter}
          </ScrollView>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.scroll}
            contentContainerStyle={[
              canvasListScrollContent(),
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={memoizedRefreshControl}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: LIST_CARD.listGap }} />
            )}
          />
        )}
      </ListLoadingGate>
    </View>
  );
}

function create_GatewayTransactionListScreen_styles(c: AppColorPalette) {
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
      marginTop: 8,
      marginBottom: 4},
    listMeta: { fontSize: 11, maxWidth: '55%', textAlign: 'right' },
    loadMoreFooter: { paddingVertical: 24, alignItems: 'center', gap: 8 },
    loadMoreText: { fontSize: 13 },
    endOfListText: { fontSize: 12 }});
}
