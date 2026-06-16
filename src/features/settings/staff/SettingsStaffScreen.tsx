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
import type { StaffUserApi } from '@services/settings/staffApiTypes';
import { deleteStaffUser } from '@services/settings/staffAPI';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import {
  fetchStaffUserCounts,
  fetchStaffUserDirectory} from '@services/settings/staffSlice';
import { StaffFilterToolbar } from './components/StaffFilterToolbar';
import { StaffListMobileCard } from './components/StaffListMobileCard';

export type SettingsStaffScreenProps = {
  onOpenDrawer: () => void;
  onOpenCreateStaff?: () => void;
  onOpenStaffDetail?: (staffUserId: number) => void;
};

const PER_PAGE = 20;

export function SettingsStaffScreen({
  onOpenDrawer,
  onOpenCreateStaff,
  onOpenStaffDetail}: SettingsStaffScreenProps) {
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
    counts,
    countsLoading} = useAppSelector(s => s.sellerStaff);

  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>(
    'all',
  );

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!directoryLoadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [directoryLoadingMore]);

  useEffect(() => {
    void dispatch(fetchStaffUserCounts());
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    void dispatch(
      fetchStaffUserDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        role: roleFilter}),
    );
  }, [dispatch, debouncedSearch, statusFilter, roleFilter]);

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
      fetchStaffUserDirectory({
        page: currentPage + 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        role: roleFilter,
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
    roleFilter,
  ]);

  const onRefresh = useCallback(() => {
    void dispatch(fetchStaffUserCounts());
    void dispatch(
      fetchStaffUserDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        role: roleFilter,
      }),
    );
  }, [dispatch, debouncedSearch, statusFilter, roleFilter]);

  const listFilterActive = statusFilter !== 'all' || roleFilter !== 'all';

  const clearListFilters = useCallback(() => {
    setStatusFilter('all');
    setRoleFilter('all');
    setQuery('');
    setDebouncedSearch('');
  }, []);

  const onAddStaff = useCallback(() => {
    if (onOpenCreateStaff) {
      onOpenCreateStaff();
      return;
    }
    toast.info('Mở form thêm nhân viên từ màn hình chính.');
  }, [onOpenCreateStaff]);

  const onView = useCallback(
    (row: StaffUserApi) => {
      if (onOpenStaffDetail) {
        onOpenStaffDetail(row.id);
        return;
      }
      toast.info(
        [
          `Email: ${row.email}`,
          row.phone ? `SĐT: ${row.phone}` : 'SĐT: Chưa có',
        ].join('\n'),
      );
    },
    [onOpenStaffDetail],
  );

  const onDelete = useCallback(
    async (row: StaffUserApi) => {
      const uuid = row.uuid?.trim();
      if (!uuid) {
        toast.error('Không có mã định danh (UUID) để xóa người dùng.');
        return;
      }
      const ok = await confirmDialog({
        title: 'Xóa người dùng',
        message: `Bạn có chắc muốn xóa người dùng ${row.name}? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        destructive: true,
      });
      if (ok) {
        try {
          await deleteStaffUser(uuid);
          toast.success(`Đã xóa người dùng ${row.name}.`);
          await Promise.all([
            dispatch(fetchStaffUserCounts()).unwrap(),
            dispatch(
              fetchStaffUserDirectory({
                page: 1,
                per_page: PER_PAGE,
                search: debouncedSearch || undefined,
                status: statusFilter,
                role: roleFilter}),
            ).unwrap(),
          ]);
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        }
      }
    },
    [dispatch, debouncedSearch, statusFilter, roleFilter],
  );

  const listHeaderMeta = `${itemCount.toLocaleString('vi-VN')} mục`;

  const renderItem = useCallback(
    ({ item }: { item: StaffUserApi }) => (
      <StaffListMobileCard
        row={item}
        onView={() => onView(item)}
        onDelete={() => { void onDelete(item); }}
      />
    ),
    [onView, onDelete],
  );

  const keyExtractor = useCallback(
    (item: StaffUserApi) => String(item.id),
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
          <StaffFilterToolbar
            filtersActive={listFilterActive}
            onClearFilters={clearListFilters}
            query={query}
            onQueryChange={setQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={k => {
              setRoleFilter(k);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={k => {
              setStatusFilter(k);
            }}
            onRefresh={onRefresh}
            refreshing={directoryRefreshing}
            primaryActionTitle="+ Thêm nhân viên"
            onPrimaryAction={onAddStaff}
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
      roleFilter,
      statusFilter,
      directoryRefreshing,
      listHeaderMeta,
      palette.textMuted,
      styles,
      clearListFilters,
      onRefresh,
      onAddStaff,
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
        <FlatList<StaffUserApi>
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
