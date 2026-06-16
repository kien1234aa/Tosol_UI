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
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import type { SellerShippingPartnerApi } from '@services/settings/shipApiTypes';
import {
  deleteSellerShippingPartner,
  testSellerShippingPartnerConnection} from '@services/settings/shipPartnerAPI';
import { fetchShipPartnerDirectory } from '@services/settings/shipPartnerSlice';
import { ConnectShipPartnerModal } from './components/ConnectShipPartnerModal';
import { ShipPartnersFilterToolbar } from './components/ShipPartnersFilterToolbar';
import { SettingsShipPartnerListMobileCard } from './components/SettingsShipPartnerListMobileCard';

export type SettingsShipPartnersScreenProps = {
  onOpenDrawer: () => void;
  onOpenEditShipPartner?: (sellerShippingPartnerSellerId: number) => void;
};

const PER_PAGE = 20;

export function SettingsShipPartnersScreen({
  onOpenDrawer,
  onOpenEditShipPartner}: SettingsShipPartnersScreenProps) {
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
  } = useAppSelector(s => s.shipPartner);

  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [refreshing, setRefreshing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [connectPartnerOpen, setConnectPartnerOpen] = useState(false);

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
      fetchShipPartnerDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter}),
    );
  }, [dispatch, debouncedSearch, statusFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(
        fetchShipPartnerDirectory({
          page: 1,
          per_page: PER_PAGE,
          search: debouncedSearch || undefined,
          status: statusFilter}),
      ).unwrap();
    } catch {
      /* slice */
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, debouncedSearch, statusFilter]);

  const currentPage = directoryMeta?.current_page ?? 0;
  const lastPage = directoryMeta?.last_page ?? 1;
  const canLoadMore = currentPage < lastPage;

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || directoryLoadingMore || directoryLoading || !canLoadMore) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(
      fetchShipPartnerDirectory({
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

  const itemCount = directoryMeta?.total ?? 0;
  const listFilterActive = statusFilter !== 'all';

  const clearListFilters = useCallback(() => {
    setStatusFilter('all');
    setQuery('');
    setDebouncedSearch('');
  }, []);

  const onConnectPartner = useCallback(() => {
    setConnectPartnerOpen(true);
  }, []);

  const connectedPartnerIds = useMemo(
    () => directoryItems.map(r => r.shipping_partner_id),
    [directoryItems],
  );

  const onEdit = useCallback(
    (row: SellerShippingPartnerApi) => {
      if (onOpenEditShipPartner) {
        onOpenEditShipPartner(row.id);
        return;
      }
      const name = row.shipping_partner?.name?.trim() || 'Đối tác';
      toast.info(`Chỉnh sửa cấu hình ${name}.`);
    },
    [onOpenEditShipPartner],
  );

  const onTestConnectionFromList = useCallback(
    (row: SellerShippingPartnerApi) => {
      void (async () => {
        setActionBusy(true);
        try {
          const res = await testSellerShippingPartnerConnection(row.id);
          const when = res.tested_at
            ? new Date(res.tested_at).toLocaleString('vi-VN')
            : '';
          toast.info(
            [
              res.message?.trim() || 'Thành công.',
              when ? `Thời điểm: ${when}` : '',
            ]
              .filter(Boolean)
              .join('\n\n'),
          );
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        } finally {
          setActionBusy(false);
        }
      })();
    },
    [],
  );

  const onDelete = useCallback(
    async (row: SellerShippingPartnerApi) => {
      if (deletingId === row.id) {
        return;
      }
      const name = row.shipping_partner?.name?.trim() || 'Đối tác';
      const ok = await confirmDialog({
        title: 'Xóa kết nối',
        message: `Xóa kết nối với ${name}? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        destructive: true,
      });
      if (ok) {
        setDeletingId(row.id);
        setActionBusy(true);
        try {
          await deleteSellerShippingPartner(row.id);
          toast.success(`Đã xóa kết nối ${name}.`);
          await dispatch(
            fetchShipPartnerDirectory({
              page: 1,
              per_page: PER_PAGE,
              search: debouncedSearch || undefined,
              status: statusFilter}),
          ).unwrap();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        } finally {
          setDeletingId(null);
          setActionBusy(false);
        }
      }
    },
    [deletingId, dispatch, debouncedSearch, statusFilter],
  );

  const listHeaderMeta = `${itemCount.toLocaleString('vi-VN')} mục`;

  const renderItem = useCallback(
    ({ item }: { item: SellerShippingPartnerApi }) => (
      <SettingsShipPartnerListMobileCard
        row={item}
        actionsLocked={actionBusy}
        onTestConnection={() => onTestConnectionFromList(item)}
        onEdit={() => onEdit(item)}
        onDelete={() => { void onDelete(item); }}
      />
    ),
    [actionBusy, onTestConnectionFromList, onEdit, onDelete],
  );

  const keyExtractor = useCallback(
    (item: SellerShippingPartnerApi) => String(item.id),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.createRow}>
          <Button
            title="+ Kết nối đối tác"
            variant="primary"
            size="sm"
            onPress={onConnectPartner}
          />
        </View>
        {directoryError ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {directoryError}
          </Text>
        ) : null}
        <CanvasListToolbarShell>
          <ShipPartnersFilterToolbar
            filtersActive={listFilterActive}
            onClearFilters={clearListFilters}
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={k => {
              setStatusFilter(k);
            }}
            onRefresh={onRefresh}
            refreshing={refreshing}
            primaryActionTitle="+ Kết nối đối tác"
            onPrimaryAction={onConnectPartner}
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
      refreshing,
      listHeaderMeta,
      palette.textMuted,
      styles,
      clearListFilters,
      onRefresh,
      onConnectPartner,
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
        loading={directoryLoading}
        refreshing={directoryRefreshing}
        itemCount={directoryItems.length}
      >
        <FlatList<SellerShippingPartnerApi>
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

      <ConnectShipPartnerModal
        visible={connectPartnerOpen}
        connectedPartnerIds={connectedPartnerIds}
        onClose={() => setConnectPartnerOpen(false)}
        onConnected={() => {
          void dispatch(
            fetchShipPartnerDirectory({
              page: 1,
              per_page: PER_PAGE,
              search: debouncedSearch || undefined,
              status: statusFilter}),
          );
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
    createRow: {
      marginBottom: 12,
      alignSelf: 'stretch'},
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
