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
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { getLocationsPage, type LocationTypeFilter } from '@services/warehouse/locationsAPI';
import type {
  LocationListItemApi,
  LocationsListMeta} from '@services/warehouse/locationsApiTypes';
import { LocationListMobileCard } from './components/LocationListMobileCard';
import { LocationsFilterToolbar } from './components/LocationsFilterToolbar';

const MAX_WINDOW = 100;

export type LocationsListScreenProps = {
  onOpenDrawer: () => void;
};

export function LocationsListScreen({
  onOpenDrawer}: LocationsListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();

  const [rows, setRows] = useState<LocationListItemApi[]>([]);
  const [meta, setMeta] = useState<LocationsListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [windowStart, setWindowStart] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [perPage] = useState(10);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LocationTypeFilter>('all');
  const [reloadKey, setReloadKey] = useState(0);


  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

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
      const r = await getLocationsPage({
        page: pageNum,
        per_page: perPage,
        search: debouncedSearch || undefined,
        type: typeFilter});
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
        e instanceof Error ? e.message : 'Không tải được danh sách vị trí kho',
      );
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [perPage, debouncedSearch, typeFilter]);

  useEffect(() => {
    void loadPageData(1, false);
  }, [loadPageData, reloadKey]);

  const onRefresh = useCallback(() => {
    setReloadKey(k => k + 1);
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
  const listFilterActive = typeFilter !== 'all' || debouncedSearch !== '';

  const clearListFilters = useCallback(() => {
    setTypeFilter('all');
    setQuery('');
    setDebouncedSearch('');
  }, []);

  const onCreate = useCallback(() => {
    toast.info('Luồng tạo vị trí trên app sẽ được bổ sung khi API tạo sẵn sàng. Hiện có thể thao tác trên web admin hoặc API.');
  }, []);

  const listHeaderMeta = `${itemCount.toLocaleString('vi-VN')} mục`;

  const renderItem = useCallback(
    ({ item }: { item: LocationListItemApi }) => (
      <LocationListMobileCard row={item} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: LocationListItemApi) => String(item.id),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.titleBlock}>
          <Text style={[styles.screenTitle, { color: palette.textPrimary }]}>
            Vị trí kho
          </Text>
          <Text style={[styles.screenSubtitle, { color: palette.textMuted }]}>
            Vị trí lưu trữ, picking và staging theo kho
          </Text>
        </View>

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
          <LocationsFilterToolbar
            query={query}
            onQueryChange={q => setQuery(q)}
            typeFilter={typeFilter}
            onTypeFilterChange={k => setTypeFilter(k)}
            onRefresh={onRefresh}
            refreshing={refreshing}
            primaryActionTitle="+ Tạo vị trí"
            onPrimaryAction={onCreate}
          />
        </CanvasListToolbarShell>

        <View style={styles.listHeaderRow}>
          <SectionTitle label="Danh sách" />
          <Text
            style={[styles.listMeta, { color: palette.textMuted }]}
            numberOfLines={2}
          >
            {listHeaderMeta}
          </Text>
        </View>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      error,
      listFilterActive,
      clearListFilters,
      query,
      typeFilter,
      onRefresh,
      refreshing,
      onCreate,
      listHeaderMeta,
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
        <FlatList<LocationListItemApi>
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
                Chưa có vị trí kho phù hợp.
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
    root: {
      flex: 1,
      backgroundColor: c.bg},
    scroll: { flex: 1 },
    titleBlock: {
      marginBottom: 14,
      gap: 4},
    screenTitle: {
      fontSize: 20,
      fontWeight: '800'},
    screenSubtitle: {
      fontSize: 13,
      fontWeight: '600'},
    createRow: {
      marginBottom: 12,
      alignSelf: 'stretch'},
    clearFilterBtn: {
      alignSelf: 'flex-start',
      marginBottom: 10},
    clearFilterText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textLink},
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
    emptyText: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8},
    loadMoreFooter: { paddingVertical: 24, alignItems: 'center', gap: 8 },
    loadMoreText: { fontSize: 13 },
    endOfListText: { fontSize: 12 }});
}
