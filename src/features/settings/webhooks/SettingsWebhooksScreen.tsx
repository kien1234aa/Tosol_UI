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
  StyleSheet,
  Text,
  View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import type { SellerWebhookApi } from '@services/settings/webhookApiTypes';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { deleteSellerWebhook } from '@services/settings/webhookAPI';
import { fetchSellerWebhookDirectory } from '@services/settings/webhookSlice';
import { SellerWebhookFormModal } from './components/SellerWebhookFormModal';
import { WebhooksFilterToolbar } from './components/WebhooksFilterToolbar';
import { SettingsWebhookListMobileCard } from './components/SettingsWebhookListMobileCard';

export type SettingsWebhooksScreenProps = {
  onOpenDrawer: () => void;
};

const PER_PAGE = 20;

export function SettingsWebhooksScreen({
  onOpenDrawer}: SettingsWebhooksScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    directoryItems,
    directoryMeta,
    directoryLoading,
    directoryRefreshing,
    directoryError,
    directoryLoadingMore,
    directoryWindowStart,
  } = useAppSelector(s => s.sellerWebhook);

  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [webhookFormOpen, setWebhookFormOpen] = useState(false);
  const [webhookEditing, setWebhookEditing] = useState<SellerWebhookApi | null>(
    null,
  );

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!directoryLoadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [directoryLoadingMore]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    void dispatch(
      fetchSellerWebhookDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter}),
    );
  }, [dispatch, debouncedSearch, statusFilter]);

  const currentPage = directoryMeta?.current_page ?? 0;
  const lastPageNum = directoryMeta?.last_page ?? 1;
  const canLoadMore = currentPage < lastPageNum;
  const itemCount = directoryMeta?.total ?? 0;

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || directoryLoadingMore || directoryLoading || !canLoadMore) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(
      fetchSellerWebhookDirectory({
        page: currentPage + 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        append: true,
      }),
    );
  }, [
    directoryLoadingMore,
    directoryLoading,
    canLoadMore,
    currentPage,
    dispatch,
    debouncedSearch,
    statusFilter,
  ]);

  const onRefresh = useCallback(() => {
    void dispatch(
      fetchSellerWebhookDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
    );
  }, [dispatch, debouncedSearch, statusFilter]);

  const listFilterActive = statusFilter !== 'all';

  const clearListFilters = useCallback(() => {
    setStatusFilter('all');
    setQuery('');
    setDebouncedSearch('');
  }, []);

  const onAddWebhook = useCallback(() => {
    setWebhookEditing(null);
    setWebhookFormOpen(true);
  }, []);

  const onEdit = useCallback((row: SellerWebhookApi) => {
    setWebhookEditing(row);
    setWebhookFormOpen(true);
  }, []);

  const onWebhookSaved = useCallback(async () => {
    await dispatch(
      fetchSellerWebhookDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter}),
    ).unwrap();
  }, [dispatch, debouncedSearch, statusFilter]);

  const onDelete = useCallback(
    async (row: SellerWebhookApi) => {
      if (deletingId === row.id) {
        return;
      }
      const ok = await confirmDialog({
        title: 'Xóa webhook',
        message: `Xóa webhook ${row.url}? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        destructive: true,
      });
      if (ok) {
        setDeletingId(row.id);
        try {
          await deleteSellerWebhook(row.id);
          toast.success(`Đã xóa webhook ${row.url}.`);
          await dispatch(
            fetchSellerWebhookDirectory({
              page: 1,
              per_page: PER_PAGE,
              search: debouncedSearch || undefined,
              status: statusFilter}),
          ).unwrap();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        } finally {
          setDeletingId(null);
        }
      }
    },
    [deletingId, dispatch, debouncedSearch, statusFilter],
  );

  const listHeaderMeta = `${itemCount.toLocaleString('vi-VN')} mục`;

  const renderItem = useCallback(
    ({ item }: { item: SellerWebhookApi }) => (
      <SettingsWebhookListMobileCard
        row={item}
        onEdit={() => onEdit(item)}
        onDelete={() => { void onDelete(item); }}
      />
    ),
    [onEdit, onDelete],
  );

  const keyExtractor = useCallback(
    (item: SellerWebhookApi) => String(item.id),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {directoryError ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {directoryError}
          </Text>
        ) : null}
        <CanvasListToolbarShell>
          <WebhooksFilterToolbar
            filtersActive={listFilterActive}
            onClearFilters={clearListFilters}
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={k => {
              setStatusFilter(k);
            }}
            onRefresh={onRefresh}
            refreshing={directoryRefreshing}
            primaryActionTitle="+ Thêm webhook"
            onPrimaryAction={onAddWebhook}
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
    [
      directoryError,
      listFilterActive,
      query,
      statusFilter,
      directoryRefreshing,
      listHeaderMeta,
      palette.textMuted,
      styles,
      clearListFilters,
      onRefresh,
      onAddWebhook,
    ],
  );

  const ListFooter = useMemo(() => {
    if (directoryLoadingMore) {
      return (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="large" color={palette.textLink} />
          <Text style={[styles.loadMoreText, { color: palette.textMuted }]}>
            Đang tải thêm…
          </Text>
        </View>
      );
    }
    if (directoryItems.length > 0 && !canLoadMore) {
      const windowEnd = directoryWindowStart + directoryItems.length;
      const total = directoryMeta?.total ?? windowEnd;
      const windowLabel =
        directoryWindowStart > 0
          ? `Hiển thị ${directoryWindowStart + 1}–${windowEnd} / ${total}`
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
  }, [
    directoryLoadingMore,
    directoryItems.length,
    canLoadMore,
    directoryWindowStart,
    directoryMeta,
    palette,
    styles,
  ]);


  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={directoryRefreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [onRefresh, directoryRefreshing, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate
        loading={directoryLoading}
        refreshing={directoryRefreshing}
        itemCount={directoryItems.length}
      >
        <FlatList<SellerWebhookApi>
          data={directoryItems}
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
          ItemSeparatorComponent={() => (
            <View style={{ height: LIST_CARD.listGap }} />
          )}
        />
      </ListLoadingGate>

      <SellerWebhookFormModal
        visible={webhookFormOpen}
        editing={webhookEditing}
        onClose={() => {
          setWebhookFormOpen(false);
          setWebhookEditing(null);
        }}
        onSaved={() => {
          void onWebhookSaved();
        }}
      />
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg},
    scroll: {
      flex: 1},
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
    loadMoreFooter: {
      paddingVertical: 24,
      alignItems: 'center',
      gap: 8},
    loadMoreText: {
      fontSize: 13},
    endOfListText: {
      fontSize: 12}});
}
