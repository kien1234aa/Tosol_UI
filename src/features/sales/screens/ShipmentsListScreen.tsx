import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState} from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { CanvasListToolbarShell } from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { LIST_CARD } from '@shared/theme/designTokens';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../components/SalesScreenHeader';
import { ShipmentListMobileCard } from '../shipments/components/ShipmentListMobileCard';
import { ShipmentsFilterToolbar } from '../shipments/components/ShipmentsFilterToolbar';
import { shipmentToListRow } from '@mappers/sales/shipmentMappers';
import type { ShipmentListRow } from '../shipments/shipmentListTypes';
import {
  clearShipmentListFilters,
  fetchShipmentCounts,
  fetchShipments,
  setShipmentListFilters} from '@services/sales/shipmentSlice';
import {
  fetchShipmentPartnerFilterOptions,
  SHIPMENT_FILTER_IN_TRANSIT} from '@services/sales/shipmentAPI';
import type {
  ShipmentListFilters,
  ShipmentPartnerFilterOption} from '@services/sales/shipmentAPI';

export type ShipmentsListScreenProps = {
  onOpenDrawer: () => void;
  onOpenOrder?: (orderNumber: string) => void;
};

/** Đã chọn ít nhất một trong hai dropdown (trạng thái / đối tác). */
function hasShipmentDropdownFilters(f: ShipmentListFilters) {

  return (
    Boolean(f.filterStatus?.trim()) ||
    Boolean(f.filterShippingPartnerCode?.trim())
  );
}

function filtersMatchPending(f: ShipmentListFilters) {
  return f.filterStatus === 'pending';
}

function filtersMatchInTransit(f: ShipmentListFilters) {
  return f.filterStatus === SHIPMENT_FILTER_IN_TRANSIT;
}

function filtersMatchDelivered(f: ShipmentListFilters) {
  return f.filterStatus === 'delivered';
}

function filtersMatchFailed(f: ShipmentListFilters) {
  return f.filterStatus === 'failed_delivery';
}

export function ShipmentsListScreen({
  onOpenDrawer,
  onOpenOrder}: ShipmentsListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ShipmentsListScreen_styles);

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    items,
    meta,
    loading,
    refreshing,
    loadingMore,
    error,
    listFilters,
    windowStart,
  } = useAppSelector(s => s.shipment);
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerOptions, setPartnerOptions] = useState<
    ShipmentPartnerFilterOption[]
  >([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const listFiltersRef = useRef(listFilters);
  listFiltersRef.current = listFilters;

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  /** Đồng bộ `filter[search]` với API (debounce). */
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchQuery.trim() || undefined;
      const cur = listFiltersRef.current.filterSearch?.trim() || undefined;
      if (next === cur) {
        return;
      }
      dispatch(
        setShipmentListFilters({
          ...listFiltersRef.current,
          filterSearch: next}),
      );
      dispatch(fetchShipments({ page: 1 }));
    }, 450);
    return () => clearTimeout(id);
  }, [searchQuery, dispatch]);

  const refreshList = useCallback(() => {
    dispatch(fetchShipments({ page: 1 }));
    dispatch(fetchShipmentCounts());
  }, [dispatch]);

  const fetchFirstPage = useCallback(() => {
    dispatch(fetchShipments({ page: 1 }));
    dispatch(fetchShipmentCounts());
  }, [dispatch]);

  const toggleListFilter = useCallback(
    (next: ShipmentListFilters, same: boolean) => {
      if (same) {
        setSearchQuery('');
        dispatch(clearShipmentListFilters());
      } else {
        dispatch(setShipmentListFilters({ ...listFilters, ...next }));
      }
      dispatch(fetchShipments({ page: 1 }));
    },
    [dispatch, listFilters],
  );

  const clearListFilters = useCallback(() => {
    setSearchQuery('');
    dispatch(clearShipmentListFilters());
    dispatch(fetchShipments({ page: 1 }));
    dispatch(fetchShipmentCounts());
  }, [dispatch]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  useEffect(() => {
    const ac = new AbortController();
    void fetchShipmentPartnerFilterOptions(ac.signal)
      .then(opts => {
        setPartnerOptions(opts);
      })
      .catch(() => {
        setPartnerOptions([]);
      })
      .finally(() => {
        setPartnersLoading(false);
      });
    return () => ac.abort();
  }, []);

  const applyStatusFilter = useCallback(
    (status: string | undefined) => {
      dispatch(
        setShipmentListFilters({
          ...listFilters,
          filterStatus: status?.trim() || undefined}),
      );
      dispatch(fetchShipments({ page: 1 }));
    },
    [dispatch, listFilters],
  );

  const applyPartnerFilter = useCallback(
    (partnerCode: string | undefined) => {
      dispatch(
        setShipmentListFilters({
          ...listFilters,
          filterShippingPartnerCode: partnerCode?.trim()
            ? partnerCode.trim().toLowerCase()
            : undefined}),
      );
      dispatch(fetchShipments({ page: 1 }));
    },
    [dispatch, listFilters],
  );

  const rows = useMemo(() => items.map(shipmentToListRow), [items]);

  const itemCount = meta?.total ?? rows.length;
  const dropdownFiltersActive = hasShipmentDropdownFilters(listFilters);

  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const canLoadMore = currentPage < lastPage;

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loadingMore || loading || !canLoadMore) {
      return;
    }
    pendingLoadMoreRef.current = true;
    dispatch(fetchShipments({ page: currentPage + 1, append: true }));
  }, [loadingMore, loading, canLoadMore, currentPage, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: ShipmentListRow }) => (
      <ShipmentListMobileCard
        row={item}
        onPress={
          onOpenOrder != null &&
          item.orderNumber &&
          item.orderNumber !== '—'
            ? () => onOpenOrder(item.orderNumber)
            : undefined
        }
      />
    ),
    [onOpenOrder],
  );

  const keyExtractor = useCallback((item: ShipmentListRow) => item.key, []);

  const ListHeader = useMemo(
    () => (
      <View>
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <CanvasListToolbarShell>
          <ShipmentsFilterToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={refreshList}
            refreshing={refreshing}
            listFilters={listFilters}
            partnerOptions={partnerOptions}
            partnersLoading={partnersLoading}
            onChangeStatus={applyStatusFilter}
            onChangePartner={applyPartnerFilter}
            filtersActive={dropdownFiltersActive}
            onClearFilters={clearListFilters}
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
    [
      error,
      searchQuery,
      refreshing,
      listFilters,
      partnerOptions,
      partnersLoading,
      dropdownFiltersActive,
      itemCount,
      palette.textMuted,
      styles,
      clearListFilters,
      refreshList,
    ],
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
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate loading={loading} refreshing={refreshing} itemCount={rows.length}>
        <FlatList<ShipmentListRow>
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

function create_ShipmentsListScreen_styles(c: AppColorPalette) {
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
