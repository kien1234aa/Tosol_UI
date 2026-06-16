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
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  InboundOrdersFilterToolbar,
  type InboundOrderListPreset} from '../components/InboundOrdersFilterToolbar';
import { InboundOrderListMobileCard } from '../components/InboundOrderListMobileCard';
import { inboundOrderToListRow } from '@mappers/warehouse/inboundOrderMappers';
import type { InboundOrderListRow } from '../inboundOrderTypes';
import { getInboundOrdersPage } from '@services/warehouse/inboundOrderAPI';
import type { InboundOrderApi } from '@services/warehouse/inboundOrderApiTypes';

const MAX_WINDOW = 100;
const PER_PAGE = 20;

export type InboundOrdersListScreenProps = {
  onOpenDrawer: () => void;
  onOpenInboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
};

function presetToApiParams(p: InboundOrderListPreset): {
  filterStatus?: string;
} {
  if (p === 'all') return {};
  return { filterStatus: p };
}

export function InboundOrdersListScreen({
  onOpenDrawer,
  onOpenInboundOrder}: InboundOrdersListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_InboundOrdersListScreen_styles);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InboundOrderApi[]>([]);
  const [windowStart, setWindowStart] = useState(0);
  const [listMeta, setListMeta] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [preset, setPreset] = useState<InboundOrderListPreset>('all');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(async (targetPage: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }
    try {
      const { filterStatus } = presetToApiParams(preset);
      const data = await getInboundOrdersPage({
        page: targetPage,
        per_page: PER_PAGE,
        filterStatus,
        search: debouncedQuery.length > 0 ? debouncedQuery : undefined,
      });
      const newItems = data.items ?? [];
      const m = data.meta;
      setListMeta(
        m ? { current_page: m.current_page, last_page: m.last_page, total: m.total } : null,
      );
      if (append) {
        setItems(prev => {
          const combined = [...prev, ...newItems];
          if (combined.length > MAX_WINDOW) {
            const dropped = combined.length - MAX_WINDOW;
            setWindowStart(ws => ws + dropped);
            return combined.slice(dropped);
          }
          return combined;
        });
      } else {
        setItems(newItems);
        setWindowStart(0);
      }
    } catch (e) {
      if (!append) {
        setItems([]);
        setListMeta(null);
        setError(e instanceof Error ? e.message : 'Không tải được lệnh nhập kho');
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [preset, debouncedQuery]);

  useEffect(() => {
    setPage(1);
    void fetchPage(1, false);
  }, [fetchPage, refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
  }, []);

  const handleLoadMore = useCallback(() => {
    const currentPage = listMeta?.current_page ?? 1;
    const lastPage = listMeta?.last_page ?? 1;
    if (pendingLoadMoreRef.current || loadingMore || loading || currentPage >= lastPage) return;
    pendingLoadMoreRef.current = true;
    const nextPage = currentPage + 1;
    setPage(nextPage);
    void fetchPage(nextPage, true);
  }, [loadingMore, loading, listMeta, fetchPage]);

  const rows: InboundOrderListRow[] = useMemo(
    () => items.map(inboundOrderToListRow),
    [items],
  );

  const goAll = useCallback(() => {
    setPreset('all');
    setPage(1);
  }, []);

  const onRow = useCallback(
    (row: InboundOrderListRow) => {
      if (onOpenInboundOrder) {
        onOpenInboundOrder({ uuid: row.uuid, orderNumber: row.orderNumber, id: row.id });
        return;
      }
      toast.info(`${row.typeLabel}\n${row.linkedOrderLabel}\n${row.warehouseName}`);
    },
    [onOpenInboundOrder],
  );

  const keyExtractor = useCallback((row: InboundOrderListRow) => String(row.id), []);

  const renderItem = useCallback(
    ({ item }: { item: InboundOrderListRow }) => (
      <InboundOrderListMobileCard row={item} onPress={() => onRow(item)} />
    ),
    [onRow],
  );

  const listFilterActive = preset !== 'all';
  const itemCount = listMeta?.total ?? rows.length;

  const listHeader = useMemo(
    () => (
      <>
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        {listFilterActive ? (
          <Pressable onPress={goAll} style={styles.clearFilterBtn} hitSlop={6}>
            <Text style={styles.clearFilterText}>Bỏ lọc danh sách</Text>
          </Pressable>
        ) : null}
        <CanvasListToolbarShell>
          <InboundOrdersFilterToolbar
            query={query}
            onQueryChange={q => {
              setQuery(q);
              setPage(1);
            }}
            preset={preset}
            onPresetChange={p => {
              setPreset(p);
              setPage(1);
            }}
          />
        </CanvasListToolbarShell>
        <View style={styles.listHeaderRow}>
          <SectionTitle label="Lệnh nhập kho" />
          <Text style={[styles.listMeta, { color: palette.textMuted }]} numberOfLines={2}>
            {itemCount.toLocaleString('vi-VN')} mục
          </Text>
        </View>
        {rows.length === 0 && !loading ? (
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>
            Không có lệnh nhập kho phù hợp.
          </Text>
        ) : null}
      </>
    ),
    [error, listFilterActive, goAll, query, preset, itemCount, rows.length, loading, palette, styles],
  );

  const listFooter = useMemo(() => {
    const currentPage = listMeta?.current_page ?? 1;
    const lastPage = listMeta?.last_page ?? 1;
    if (loadingMore) {
      return (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="large" color={palette.textLink} />
          <Text style={[styles.loadMoreText, { color: palette.textMuted }]}>Đang tải thêm…</Text>
        </View>
      );
    }
    if (rows.length > 0 && currentPage >= lastPage) {
      return (
        <View style={styles.loadMoreFooter}>
          <Text style={[styles.endOfListText, { color: palette.textMuted }]}>
            {windowStart > 0
              ? `Hiển thị ${windowStart + 1}–${windowStart + rows.length} / ${itemCount.toLocaleString('vi-VN')} mục`
              : 'Đã hiển thị tất cả'}
          </Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, rows.length, listMeta, windowStart, itemCount, palette, styles]);

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
        itemCount={items.length}
        options={{ canShowSkeleton: !error }}
      >
        <FlatList
          style={styles.scroll}
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          contentContainerStyle={[
            canvasListScrollContent(),
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
        />
      </ListLoadingGate>
    </View>
  );
}

function create_InboundOrdersListScreen_styles(c: AppColorPalette) {
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
    clearFilterBtn: {
      alignSelf: 'flex-start',
      marginBottom: 10},
    clearFilterText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textLink},
    cardList: { gap: LIST_CARD.listGap, marginTop: 8 },
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 8},
    listMeta: { fontSize: 11, maxWidth: '55%', textAlign: 'right' },
    emptyText: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8},
    statsRowSpacer: {
      flex: 1,
      minWidth: 0,
      opacity: 0},
    loadMoreFooter: { paddingVertical: 24, alignItems: 'center', gap: 8 },
    loadMoreText: { fontSize: 13 },
    endOfListText: { fontSize: 12 }});
}
