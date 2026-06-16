import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { resetSalesStackForDrawerId } from '../../sales/navigation/salesNavigationRef';
import type {
  InventoryAlertListItemApi,
  InventoryAlertsListMeta} from '@services/warehouse/inventoryAlertsApiTypes';
import {
  getInventoryAlertsPage,
  type InventoryAlertTypeFilter} from '@services/warehouse/inventoryAlertsAPI';
import { InventoryAlertListMobileCard } from './components/InventoryAlertListMobileCard';
import {
  InventoryAlertsFilterToolbar,
  type WarehouseFilterOption} from './components/InventoryAlertsFilterToolbar';

const INFO_BANNER_KEY = '@tosol/stock_alerts_info_banner_dismissed_v1';
const MAX_WINDOW = 100;

export type StockAlertsListScreenProps = {
  onOpenDrawer: () => void;
  onOpenInventoryProduct?: (productId: number) => void;
};

export function StockAlertsListScreen({
  onOpenDrawer,
  onOpenInventoryProduct}: StockAlertsListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const { user, selectedWarehouseId } = useAppSelector(s => s.auth);

  const [rows, setRows] = useState<InventoryAlertListItemApi[]>([]);
  const [meta, setMeta] = useState<InventoryAlertsListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [windowStart, setWindowStart] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [perPage] = useState(20);
  const [alertTypeFilter, setAlertTypeFilter] =
    useState<InventoryAlertTypeFilter>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<number | 'all'>('all');
  const [reloadKey, setReloadKey] = useState(0);

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    void AsyncStorage.getItem(INFO_BANNER_KEY).then(v =>
      setBannerDismissed(v === '1'),
    );
  }, []);

  useEffect(() => {
    setWarehouseFilter(selectedWarehouseId ?? 'all');
  }, [selectedWarehouseId]);

  const defaultWarehouse = selectedWarehouseId ?? 'all';

  const warehouseDropdownOptions = useMemo((): WarehouseFilterOption[] => {
    const w = user?.warehouses ?? [];
    return [
      { id: 'all', label: 'Tất cả kho' },
      ...w.map(x => ({ id: x.id, label: x.name })),
    ];
  }, [user?.warehouses]);

  const warehouseIdParam = warehouseFilter === 'all' ? null : warehouseFilter;

  const loadPageData = useCallback(async (pageNum: number, append: boolean) => {
    if (!append) {
      setLoading(rowsRef.current.length === 0);
      setRefreshing(rowsRef.current.length > 0);
      setWindowStart(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const r = await getInventoryAlertsPage({
        page: pageNum,
        per_page: perPage,
        alertType: alertTypeFilter,
        warehouseId: warehouseIdParam});
      if (append) {
        setRows(prev => {
          const combined = [...prev, ...r.items];
          if (combined.length > MAX_WINDOW) {
            const dropped = combined.length - MAX_WINDOW;
            setWindowStart(ws => ws + dropped);
            return combined.slice(dropped);
          }
          return combined;
        });
      } else {
        setRows(r.items);
      }
      setMeta(r.meta);
    } catch (e: unknown) {
      if (!append) {
        setRows([]);
        setMeta(null);
      }
      setError(
        e instanceof Error ? e.message : 'Không tải được cảnh báo tồn kho',
      );
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [perPage, alertTypeFilter, warehouseIdParam]);

  useEffect(() => {
    void loadPageData(1, false);
  }, [loadPageData, reloadKey]);

  const onRefresh = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  const dismissBanner = useCallback(() => {
    void AsyncStorage.setItem(INFO_BANNER_KEY, '1');
    setBannerDismissed(true);
  }, []);

  const onOpenInventory = useCallback(() => {
    resetSalesStackForDrawerId('goods:my-inventory');
  }, []);

  const handleLoadMore = useCallback(() => {
    const currentPage = meta?.current_page ?? 1;
    const lastPage = meta?.last_page ?? 1;
    if (pendingLoadMoreRef.current || loadingMore || loading || currentPage >= lastPage) return;
    pendingLoadMoreRef.current = true;
    void loadPageData(currentPage + 1, true);
  }, [loadingMore, loading, meta, loadPageData]);

  const itemCount = meta?.total ?? 0;
  const canLoadMore = (meta?.current_page ?? 1) < (meta?.last_page ?? 1);

  const listFilterActive =
    alertTypeFilter !== 'all' || warehouseFilter !== defaultWarehouse;

  const clearListFilters = useCallback(() => {
    setAlertTypeFilter('all');
    setWarehouseFilter(defaultWarehouse);
  }, [defaultWarehouse]);

  const onToolbarRefresh = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: InventoryAlertListItemApi }) => (
      <InventoryAlertListMobileCard
        row={item}
        onViewProduct={onOpenInventoryProduct}
      />
    ),
    [onOpenInventoryProduct],
  );

  const keyExtractor = useCallback(
    (item: InventoryAlertListItemApi) => String(item.id),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {!bannerDismissed ? (
          <View
            style={[
              styles.infoBanner,
              {
                backgroundColor: palette.blueBg,
                borderColor: 'rgba(96,165,250,0.35)'},
            ]}
          >
            <SystemIcon name="info" size={18} color={palette.teal} />
            <Text
              style={[styles.infoBannerTxt, { color: palette.textSecondary }]}
            >
              Cảnh báo tồn kho giúp theo dõi: sản phẩm hết hàng, sắp hết, và sắp
              hết hạn sử dụng.
            </Text>
            <Pressable
              onPress={dismissBanner}
              hitSlop={10}
              accessibilityLabel="Đóng thông báo"
            >
              <SystemIcon name="close" size={20} color={palette.textMuted} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={[styles.screenTitle, { color: palette.textPrimary }]}>
              Cảnh báo tồn kho
            </Text>
            <Text style={[styles.screenSubtitle, { color: palette.textMuted }]}>
              Theo dõi cảnh báo tồn kho và hạn sử dụng
            </Text>
          </View>
          <Button
            title="Xem tồn kho"
            variant="secondary"
            size="sm"
            onPress={onOpenInventory}
            style={styles.invBtn}
          />
        </View>

        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <CanvasListToolbarShell>
          <InventoryAlertsFilterToolbar
            alertType={alertTypeFilter}
            onAlertTypeChange={v => setAlertTypeFilter(v)}
            warehouseFilter={warehouseFilter}
            onWarehouseFilterChange={v => setWarehouseFilter(v)}
            warehouseOptions={warehouseDropdownOptions}
            listLoading={loading && rows.length > 0}
            onRefreshPress={onToolbarRefresh}
            filtersActive={listFilterActive}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      bannerDismissed,
      dismissBanner,
      onOpenInventory,
      error,
      alertTypeFilter,
      warehouseFilter,
      warehouseDropdownOptions,
      loading,
      rows.length,
      onToolbarRefresh,
      listFilterActive,
      clearListFilters,
      itemCount,
      palette,
      styles,
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
          : '— Hết danh sách —';
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
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [onRefresh, refreshing, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate loading={loading} refreshing={refreshing} itemCount={rows.length}>
        <FlatList<InventoryAlertListItemApi>
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
          ListEmptyComponent={
            !loading && !refreshing ? (
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                Không có cảnh báo phù hợp.
              </Text>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
      </ListLoadingGate>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { flex: 1 },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderRadius: 10,
      borderWidth: 1},
    infoBannerTxt: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 14},
    titleCol: { flex: 1, minWidth: 0, gap: 4 },
    invBtn: { flexShrink: 0, marginTop: 2 },
    screenTitle: { fontSize: 20, fontWeight: '800' },
    screenSubtitle: { fontSize: 13, fontWeight: '600' },
    clearFilterBtn: { alignSelf: 'flex-start', marginBottom: 10 },
    clearFilterText: { fontSize: 13, fontWeight: '700', color: c.textLink },
    errorText: {
      marginBottom: 10,
      fontSize: 13,
      color: c.red,
      fontWeight: '600'},
    cardList: { gap: LIST_CARD.listGap, marginTop: 8 },
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 4,
      marginTop: 8},
    listMeta: { fontSize: 11, maxWidth: '55%', textAlign: 'right' },
    emptyText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    loadMoreFooter: { paddingVertical: 24, alignItems: 'center', gap: 8 },
    loadMoreText: { fontSize: 13 },
    endOfListText: { fontSize: 12 }});
}
