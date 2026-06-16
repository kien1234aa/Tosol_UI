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
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  activateBankAccount,
  deactivateBankAccount,
  deleteBankAccount,
  setBankAccountAsDefault} from '@services/settings/bankAccountAPI';
import { fetchBankAccountDirectory } from '@services/settings/bankAccountSlice';
import type { BankAccountListItem } from '@services/settings/bankAccountResponseTypes';
import { BankAccountsFilterToolbar } from './components/BankAccountsFilterToolbar';
import { BankAccountListMobileCard } from './components/BankAccountListMobileCard';

export type SettingsBankAccountsScreenProps = {
  onOpenDrawer: () => void;
  onOpenCreateBankAccount?: () => void;
  onOpenEditBankAccount?: (accountId: number) => void;
};

const PER_PAGE = 20;

export function SettingsBankAccountsScreen({
  onOpenDrawer,
  onOpenCreateBankAccount,
  onOpenEditBankAccount}: SettingsBankAccountsScreenProps) {
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
  } = useAppSelector(s => s.bankAccount);

  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDefaultFilter, setIsDefaultFilter] = useState<'all' | 'yes' | 'no'>(
    'all',
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [actionBusy, setActionBusy] = useState(false);

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
      fetchBankAccountDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        isDefaultFilter}),
    );
  }, [dispatch, debouncedSearch, statusFilter, isDefaultFilter]);

  const onRefresh = useCallback(() => {
    void dispatch(
      fetchBankAccountDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        isDefaultFilter,
      }),
    );
  }, [dispatch, debouncedSearch, statusFilter, isDefaultFilter]);

  const refetchDirectory = useCallback(() => {
    return dispatch(
      fetchBankAccountDirectory({
        page: 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        isDefaultFilter}),
    ).unwrap();
  }, [dispatch, debouncedSearch, statusFilter, isDefaultFilter]);

  const currentPage = directoryMeta?.current_page ?? 0;
  const lastPage = directoryMeta?.last_page ?? 1;
  const canLoadMore = currentPage < lastPage;
  const itemCount = directoryMeta?.total ?? 0;

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || directoryLoadingMore || directoryLoading || !canLoadMore) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(
      fetchBankAccountDirectory({
        page: currentPage + 1,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter,
        isDefaultFilter,
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
    isDefaultFilter,
  ]);

  const listFilterActive = statusFilter !== 'all' || isDefaultFilter !== 'all';

  const clearListFilters = useCallback(() => {
    setStatusFilter('all');
    setIsDefaultFilter('all');
    setQuery('');
    setDebouncedSearch('');
  }, []);

  const onAddAccount = useCallback(() => {
    onOpenCreateBankAccount?.();
  }, [onOpenCreateBankAccount]);

  const onSetDefault = useCallback(
    async (row: BankAccountListItem) => {
      const ok = await confirmDialog({
        title: 'Đặt mặc định',
        message: `Đặt ${row.account_name} (${row.bank_name}) làm tài khoản mặc định?`,
        confirmText: 'Xác nhận',
      });
      if (ok) {
        setActionBusy(true);
        try {
          await setBankAccountAsDefault(row.id);
          toast.success(`Đã đặt ${row.account_name} làm tài khoản mặc định.`);
          await refetchDirectory();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        } finally {
          setActionBusy(false);
        }
      }
    },
    [refetchDirectory],
  );

  const onToggleActive = useCallback(
    async (row: BankAccountListItem) => {
      const deactivating = row.is_active;
      const verb = deactivating ? 'vô hiệu hóa' : 'kích hoạt';
      const ok = await confirmDialog({
        title: deactivating ? 'Vô hiệu hóa' : 'Kích hoạt',
        message: `Bạn có muốn ${verb} tài khoản ${row.account_name} (${row.bank_name})?`,
        confirmText: 'Xác nhận',
        destructive: deactivating,
      });
      if (ok) {
        setActionBusy(true);
        try {
          if (deactivating) {
            await deactivateBankAccount(row.id);
            toast.success(`Đã vô hiệu hóa tài khoản ${row.account_name}.`);
          } else {
            await activateBankAccount(row.id);
            toast.success(`Đã kích hoạt tài khoản ${row.account_name}.`);
          }
          await refetchDirectory();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        } finally {
          setActionBusy(false);
        }
      }
    },
    [refetchDirectory],
  );

  const onEdit = useCallback(
    (row: BankAccountListItem) => {
      if (onOpenEditBankAccount) {
        onOpenEditBankAccount(row.id);
        return;
      }
      toast.info(`Mở form sửa cho ${row.account_name} khi API sẵn sàng.`);
    },
    [onOpenEditBankAccount],
  );

  const onDelete = useCallback(
    async (row: BankAccountListItem) => {
      const ok = await confirmDialog({
        title: 'Xóa tài khoản ngân hàng',
        message: `Xóa vĩnh viễn tài khoản ${row.account_name} tại ${row.bank_name} (số: ${row.account_number})? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        destructive: true,
      });
      if (ok) {
        setActionBusy(true);
        try {
          await deleteBankAccount(row.id);
          toast.success(`Đã xóa tài khoản ${row.account_name}.`);
          await refetchDirectory();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
        } finally {
          setActionBusy(false);
        }
      }
    },
    [refetchDirectory],
  );

  const listHeaderMeta = `${itemCount.toLocaleString('vi-VN')} mục`;

  const renderItem = useCallback(
    ({ item }: { item: BankAccountListItem }) => (
      <BankAccountListMobileCard
        row={item}
        actionsLocked={actionBusy}
        onSetDefault={() => { void onSetDefault(item); }}
        onToggleActive={() => { void onToggleActive(item); }}
        onEdit={() => onEdit(item)}
        onDelete={() => { void onDelete(item); }}
      />
    ),
    [actionBusy, onSetDefault, onToggleActive, onEdit, onDelete],
  );

  const keyExtractor = useCallback(
    (item: BankAccountListItem) => String(item.id),
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
          <BankAccountsFilterToolbar
            filtersActive={listFilterActive}
            onClearFilters={clearListFilters}
            query={query}
            onQueryChange={setQuery}
            isDefaultFilter={isDefaultFilter}
            onIsDefaultFilterChange={k => {
              setIsDefaultFilter(k);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={k => {
              setStatusFilter(k);
            }}
            onRefresh={onRefresh}
            refreshing={directoryRefreshing}
            primaryActionTitle="+ Thêm tài khoản"
            onPrimaryAction={onAddAccount}
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
      isDefaultFilter,
      statusFilter,
      directoryRefreshing,
      listHeaderMeta,
      palette.textMuted,
      styles,
      clearListFilters,
      onRefresh,
      onAddAccount,
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
        <FlatList<BankAccountListItem>
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
