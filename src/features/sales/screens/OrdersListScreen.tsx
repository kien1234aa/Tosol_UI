import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
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
import { SalesScreenHeader } from '../components/SalesScreenHeader';
import { sellerChromeScrollContent } from '@shared/components/sellerChrome';
import { CanvasListSection, CanvasListToolbarShell } from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { OrdersAdvancedFilterModal } from '../orders/components/OrdersAdvancedFilterModal';
import { OrdersSearchToolbar } from '../orders/components/OrdersSearchToolbar';
import { OrderListMobileCard } from '../orders/components/OrderListMobileCard';
import { saleOrderToListRow } from '@mappers/sales/orderMappers';
import type { OrderListRow } from '../orders/orderTypes';
import type { SaleOrderListFilters } from '@services/sales/orderAPI';
import { fetchSalesMenuShops } from '@services/settings/shopSlice';
import {
  clearOrderListFilters,
  fetchOrderCounts,
  fetchSaleOrders,
  setOrderListFilters,
  setOrderListShopId} from '@services/sales/orderSlice';

export type OrdersListScreenProps = {
  /** Có = danh sách đơn của một cửa hàng (`filter[shop_id]`). Không = «Tất cả đơn hàng». Cùng màn, cùng bộ lọc nâng cao. */
  shopId?: number;
  onOpenDrawer: () => void;
  onCreateOrder?: (preferredShopId?: number) => void;
  onOpenOrder?: (orderNumber: string) => void;
};

function hasListFilters(f: SaleOrderListFilters) {

  return (
    Boolean(f.filterSearch?.trim()) ||
    Boolean(f.filterStatus?.trim()) ||
    f.filterHasIssue === true ||
    f.filterHasIssue === false ||
    Boolean(f.filterPaymentStatus?.trim()) ||
    Boolean(f.filterDateFrom?.trim()) ||
    Boolean(f.filterDateTo?.trim())
  );
}

function filtersMatchPending(f: SaleOrderListFilters) {
  return f.filterStatus === 'pending' && f.filterHasIssue !== true;
}

function filtersMatchProcessing(f: SaleOrderListFilters) {
  return f.filterStatus === 'confirmed,packing';
}

function filtersMatchDelivered(f: SaleOrderListFilters) {
  return f.filterStatus === 'delivered';
}

function filtersMatchHasIssue(f: SaleOrderListFilters) {
  return f.filterHasIssue === true;
}

export function OrdersListScreen({
  shopId,
  onOpenDrawer,
  onCreateOrder,
  onOpenOrder}: OrdersListScreenProps) {
  const { t, i18n } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_OrdersListScreen_styles);

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { menuShops } = useAppSelector(s => s.shop);
  const { items, meta, loading, refreshing, loadingMore, error, listFilters, counts, countsLoading, listShopId, windowStart } =
    useAppSelector(s => s.order);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => listFilters.filterSearch?.trim() ?? '',
  );
  const listFiltersRef = useRef(listFilters);
  listFiltersRef.current = listFilters;

  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchQuery.trim() || undefined;
      const cur = listFiltersRef.current.filterSearch?.trim() || undefined;
      if (next === cur) {
        return;
      }
      dispatch(
        setOrderListFilters({
          ...listFiltersRef.current,
          filterSearch: next,
        }),
      );
      dispatch(fetchSaleOrders({ page: 1 }));
    }, 450);
    return () => clearTimeout(id);
  }, [searchQuery, dispatch]);

  const refreshList = useCallback(() => {
    dispatch(fetchSaleOrders({ page: 1 }));
    dispatch(fetchOrderCounts());
  }, [dispatch]);

  const toggleListFilter = useCallback(
    (next: SaleOrderListFilters, same: boolean) => {
      if (same) {
        setSearchQuery('');
        dispatch(clearOrderListFilters());
      } else {
        dispatch(setOrderListFilters(next));
      }
      dispatch(fetchSaleOrders({ page: 1 }));
    },
    [dispatch],
  );

  const clearListFilters = useCallback(() => {
    setSearchQuery('');
    dispatch(clearOrderListFilters());
    dispatch(fetchSaleOrders({ page: 1 }));
    dispatch(fetchOrderCounts());
  }, [dispatch]);

  const applyAdvancedFilters = useCallback(
    (next: SaleOrderListFilters) => {
      dispatch(
        setOrderListFilters({
          ...next,
          filterSearch: listFiltersRef.current.filterSearch,
        }),
      );
      dispatch(fetchSaleOrders({ page: 1 }));
      dispatch(fetchOrderCounts());
    },
    [dispatch],
  );

  useEffect(() => {
    if (shopId != null && menuShops.length === 0) {
      void dispatch(fetchSalesMenuShops());
    }
  }, [shopId, menuShops.length, dispatch]);

  useEffect(() => {
    const nextShopId = shopId ?? null;
    if (listShopId === nextShopId && items.length > 0) {
      return;
    }
    setSearchQuery('');
    dispatch(setOrderListShopId(nextShopId));
    dispatch(clearOrderListFilters());
    void dispatch(fetchSaleOrders({ page: 1 }));
    void dispatch(fetchOrderCounts());
  }, [shopId, dispatch, listShopId, items.length]);

  const rows = useMemo(() => items.map(saleOrderToListRow), [items]);

  const itemCount = meta?.total ?? rows.length;

  const shopScopeHint = useMemo(() => {
    if (shopId == null) {
      return undefined;
    }
    const name = menuShops.find(s => s.id === shopId)?.name?.trim();
    return name && name.length > 0
      ? t('orders.list.scopeNamed', { name })
      : t('orders.list.scopeNumbered', { id: shopId });
  }, [shopId, menuShops, t]);

  const listFilterActive = hasListFilters(listFilters);

  const handleCreateOrder = useCallback(() => {
    onCreateOrder?.(shopId);
  }, [onCreateOrder, shopId]);

  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const canLoadMore = currentPage < lastPage;

  // Ref để chặn double-fire của onEndReached trước khi Redux state kịp cập nhật
  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loadingMore || loading || !canLoadMore) {
      return;
    }
    pendingLoadMoreRef.current = true;
    dispatch(fetchSaleOrders({ page: currentPage + 1, append: true }));
  }, [loadingMore, loading, canLoadMore, currentPage, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: OrderListRow }) => (
      <OrderListMobileCard
        row={item}
        onPress={onOpenOrder != null ? () => onOpenOrder(item.id) : undefined}
      />
    ),
    [onOpenOrder],
  );

  const keyExtractor = useCallback((item: OrderListRow) => item.key, []);

  const listHeaderActive = listFilterActive;

  const ListHeader = useMemo(
    () => (
      <View>
        {listHeaderActive ? (
          <Pressable
            onPress={clearListFilters}
            style={styles.clearFilterBtn}
            hitSlop={6}
          >
            <Text style={styles.clearFilterText}>
              {t('orders.list.clearFilters')}
            </Text>
          </Pressable>
        ) : null}

        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <CanvasListToolbarShell>
          <OrdersSearchToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onAdvancedFilter={() => setAdvancedOpen(true)}
            onCreateOrder={onCreateOrder != null ? handleCreateOrder : undefined}
            onRefresh={refreshList}
            refreshing={refreshing}
          />
        </CanvasListToolbarShell>

        <CanvasListSection>
          <View style={styles.listHeaderRow}>
            <SectionTitle label={t('orders.list.sectionList')} />
            <Text
              style={[styles.listMeta, { color: palette.textMuted }]}
              numberOfLines={2}
            >
              {t('orders.list.itemCount', {
                count: itemCount,
              })}
            </Text>
          </View>
        </CanvasListSection>
      </View>
    ),
    [
      listHeaderActive,
      error,
      searchQuery,
      refreshing,
      itemCount,
      i18n.language,
      t,
      palette.textMuted,
      styles,
      clearListFilters,
      handleCreateOrder,
      refreshList,
      onCreateOrder,
    ],
  );

  const ListFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="large" color={palette.textLink} />
          <Text style={[styles.loadMoreText, { color: palette.textMuted }]}>
            {t('orders.list.loadingMore', { defaultValue: 'Đang tải thêm…' })}
          </Text>
        </View>
      );
    }
    if (rows.length > 0 && !canLoadMore) {
      const windowEnd = windowStart + rows.length;
      const total = meta?.total ?? windowEnd;
      const windowLabel =
        windowStart > 0
          ? t('orders.list.windowRange', {
              from: windowStart + 1,
              to: windowEnd,
              total,
              defaultValue: `Hiển thị ${windowStart + 1}–${windowEnd} / ${total}`,
            })
          : t('orders.list.endOfList', { defaultValue: 'Đã hiển thị tất cả' });
      return (
        <View style={styles.loadMoreFooter}>
          <Text style={[styles.endOfListText, { color: palette.textMuted }]}>
            {windowLabel}
          </Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, canLoadMore, rows.length, windowStart, meta, palette, styles, t]);

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
      <OrdersAdvancedFilterModal
        key={shopId != null ? `orders-adv-${shopId}` : 'orders-adv-all'}
        visible={advancedOpen}
        appliedFilters={listFilters}
        scopeHint={shopScopeHint}
        onClose={() => setAdvancedOpen(false)}
        onApply={applyAdvancedFilters}
      />
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate
        loading={loading}
        refreshing={refreshing}
        itemCount={rows.length}
      >
        <FlatList<OrderListRow>
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.scroll}
          contentContainerStyle={sellerChromeScrollContent({ paddingBottom: insets.bottom + 20 })}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          // Giữ vị trí cuộn khi sliding window xóa item khỏi đầu danh sách
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
      </ListLoadingGate>
    </View>
  );
}

function create_OrdersListScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg},
    scroll: {
      flex: 1},
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

    cardList: {
      gap: LIST_CARD.listGap,
      marginTop: 4},
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 4},
    listMeta: {
      fontSize: 11,
      maxWidth: '55%',
      textAlign: 'right'},
    loadMoreFooter: {
      paddingVertical: 24,
      alignItems: 'center',
      gap: 8},
    loadMoreText: {
      fontSize: 13},
    endOfListText: {
      fontSize: 12}});
}
