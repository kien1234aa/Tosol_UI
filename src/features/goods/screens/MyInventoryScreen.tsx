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
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  InventoryFilterToolbar,
  type WarehouseFilterOption} from '../myInventory/components/InventoryFilterToolbar';
import { InventoryLineListMobileCard } from '../myInventory/components/InventoryLineListMobileCard';
import { inventoryListItemToLineRow } from '@mappers/warehouse/inventoryMappers';
import type {
  InventoryLineRow,
  InventoryStockPreset} from '../myInventory/myInventoryTypes';
import { getInventoryItemsPage } from '@services/warehouse/inventoryAPI';
import type { InventoryListMeta } from '@services/warehouse/inventoryItemsApiTypes';

const INFO_BANNER_KEY = '@tosol/inventory_mgmt_info_banner_v1';
const MAX_WINDOW = 100;

export type MyInventoryScreenProps = {
  onOpenDrawer: () => void;
  onOpenInventoryProduct?: (productId: number) => void;
};

export function MyInventoryScreen({
  onOpenDrawer,
  onOpenInventoryProduct}: MyInventoryScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_MyInventoryScreen_styles);
  const insets = useSafeAreaInsets();
  const { user, selectedWarehouseId } = useAppSelector(s => s.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [windowStart, setWindowStart] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<InventoryLineRow[]>([]);
  const [listMeta, setListMeta] = useState<InventoryListMeta | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [preset, setPreset] = useState<InventoryStockPreset>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<number | 'all'>('all');
  const [perPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);


  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    void AsyncStorage.getItem(INFO_BANNER_KEY).then(v =>
      setBannerDismissed(v === '1'),
    );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setWarehouseFilter(selectedWarehouseId ?? 'all');
  }, [selectedWarehouseId]);

  const defaultWarehouse = selectedWarehouseId ?? 'all';
  const warehouseIdParam = warehouseFilter === 'all' ? null : warehouseFilter;

  const warehouseDropdownOptions = useMemo((): WarehouseFilterOption[] => {
    const w = user?.warehouses ?? [];
    if (w.length === 0) {
      return [];
    }
    return [
      { id: 'all', label: 'Tất cả kho' },
      ...w.map(x => ({ id: x.id, label: x.name })),
    ];
  }, [user?.warehouses]);

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
      const r = await getInventoryItemsPage({
        page: pageNum,
        per_page: perPage,
        preset,
        warehouseId: warehouseIdParam,
        search: debouncedSearch || undefined});
      const newItems = r.items.map(inventoryListItemToLineRow);
      if (append) {
        setRows(prev => {
          const combined = [...prev, ...newItems];
          if (combined.length > MAX_WINDOW) {
            const dropped = combined.length - MAX_WINDOW;
            setWindowStart(ws => ws + dropped);
            return combined.slice(dropped);
          }
          return combined;
        });
      } else {
        setRows(newItems);
      }
      setListMeta(r.meta);
    } catch (e: unknown) {
      if (!append) {
        setRows([]);
        setListMeta(null);
      }
      setError(e instanceof Error ? e.message : 'Không tải được tồn kho');
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [perPage, preset, warehouseIdParam, debouncedSearch]);

  useEffect(() => {
    void loadPageData(1, false);
  }, [loadPageData, refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleLoadMore = useCallback(() => {
    const currentPage = listMeta?.current_page ?? 1;
    const lastPage = listMeta?.last_page ?? 1;
    if (pendingLoadMoreRef.current || loadingMore || loading || currentPage >= lastPage) return;
    pendingLoadMoreRef.current = true;
    void loadPageData(currentPage + 1, true);
  }, [loadingMore, loading, listMeta, loadPageData]);

  const dismissBanner = useCallback(() => {
    void AsyncStorage.setItem(INFO_BANNER_KEY, '1');
    setBannerDismissed(true);
  }, []);

  const selectAllStats = useCallback(() => {
    setPreset('all');
    setWarehouseFilter(defaultWarehouse);
    setQuery('');
    setDebouncedSearch('');
  }, [defaultWarehouse]);

  const listFilterActive =
    preset !== 'all' ||
    warehouseFilter !== defaultWarehouse ||
    debouncedSearch !== '';

  const clearListFilters = selectAllStats;

  const onViewRow = useCallback(
    (row: InventoryLineRow) => {
      if (onOpenInventoryProduct) {
        onOpenInventoryProduct(row.productId);
        return;
      }
      toast.info(`SKU ${row.sku}\nSL: ${row.quantity} · Giữ: ${row.reserved} · Bán: ${row.available}\n${row.warehouseName}`);
    },
    [onOpenInventoryProduct],
  );

  const itemCount = listMeta?.total ?? rows.length;
  const showWarehouseToolbar = warehouseDropdownOptions.length > 0;
  const canLoadMore = (listMeta?.current_page ?? 1) < (listMeta?.last_page ?? 1);

  const renderItem = useCallback(
    ({ item }: { item: InventoryLineRow }) => (
      <InventoryLineListMobileCard
        row={item}
        onPress={() => onViewRow(item)}
      />
    ),
    [onViewRow],
  );

  const keyExtractor = useCallback(
    (item: InventoryLineRow) => String(item.inventoryId),
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
              Tồn kho được cập nhật tự động khi nhập/xuất kho. Nếu số lượng thực
              tế khác hệ thống, sử dụng điều chỉnh tồn kho trên web admin.
            </Text>
            <Pressable
              onPress={dismissBanner}
              hitSlop={10}
              accessibilityLabel="Đóng"
            >
              <SystemIcon name="close" size={20} color={palette.textMuted} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={[styles.screenTitle, { color: palette.textPrimary }]}>
              Quản lý tồn kho
            </Text>
            <Text style={[styles.screenSubtitle, { color: palette.textMuted }]}>
              Quản lý tồn kho theo vị trí và thực hiện điều chỉnh
            </Text>
          </View>
          <Pressable
            onPress={onRefresh}
            hitSlop={10}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <SystemIcon name="refresh" size={22} color={palette.textLink} />
          </Pressable>
        </View>

        {listFilterActive ? (
          <Pressable
            onPress={clearListFilters}
            style={styles.clearFilterBtn}
            hitSlop={6}
          >
            <Text style={styles.clearFilterText}>Bỏ lọc danh sách</Text>
          </Pressable>
        ) : null}

        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <CanvasListToolbarShell>
          <InventoryFilterToolbar
            query={query}
            onQueryChange={setQuery}
            warehouseFilter={showWarehouseToolbar ? warehouseFilter : undefined}
            onWarehouseFilterChange={
              showWarehouseToolbar ? v => setWarehouseFilter(v) : undefined
            }
            warehouseOptions={
              showWarehouseToolbar ? warehouseDropdownOptions : undefined
            }
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
      onRefresh,
      listFilterActive,
      clearListFilters,
      error,
      query,
      showWarehouseToolbar,
      warehouseFilter,
      warehouseDropdownOptions,
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
      const total = listMeta?.total ?? windowEnd;
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
  }, [loadingMore, canLoadMore, rows.length, windowStart, listMeta, palette, styles]);

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
        itemCount={rows.length}
        options={{ canShowSkeleton: !error }}
      >
        <FlatList<InventoryLineRow>
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
                Không có dòng tồn phù hợp.
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

function create_MyInventoryScreen_styles(c: AppColorPalette) {
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
      marginBottom: 12},
    titleCol: { flex: 1, minWidth: 0, gap: 4 },
    screenTitle: { fontSize: 20, fontWeight: '800' },
    screenSubtitle: { fontSize: 13, fontWeight: '600' },
    iconBtn: { padding: 6, marginTop: 2 },
    statsBlock: { gap: 8, marginBottom: 4 },
    statRowDamaged: { flexDirection: 'row', marginBottom: 6 },
    statDamagedCell: { width: '30%', minWidth: 132, maxWidth: 160 },
    statDamagedMetric: { flex: 0 },
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
