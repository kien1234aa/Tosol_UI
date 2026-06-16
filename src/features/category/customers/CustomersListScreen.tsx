import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { CanvasListToolbarShell } from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { BRAND_HEX, ON_BRAND } from '@shared/theme/designTokens';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useListTableLayout } from '@shared/hooks/useListTableLayout';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { deleteCustomer } from '@services/category/customerAPI';
import { fetchCustomerList } from '@services/category/customerListSlice';
import { CustomersFilterToolbar } from './components/CustomersFilterToolbar';
import { CustomerListMobileCard } from './components/CustomerListMobileCard';
import { CustomersTable } from './components/CustomersTable';
import { customerApiToRow } from '@mappers/category/customerListMappers';
import type { CustomerListRow } from './customerListTypes';

export type CustomersListScreenProps = {
  onOpenDrawer: () => void;
  onCreateCustomer?: () => void;
  onOpenCustomer?: (customerId: number) => void;
};

export function CustomersListScreen({
  onOpenDrawer,
  onCreateCustomer,
  onOpenCustomer,
}: CustomersListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_CustomersListScreen_styles);
  const useTable = useListTableLayout();

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    items: rawItems,
    meta,
    loading,
    refreshing,
    error,
    loadingMore,
    windowStart,
  } = useAppSelector(s => s.customerList);

  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const pendingLoadMoreRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) {
      pendingLoadMoreRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.trim()), 450);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    void dispatch(
      fetchCustomerList({ page: 1, search: debouncedSearch || undefined }),
    );
  }, [dispatch, debouncedSearch]);

  const onRefresh = useCallback(() => {
    void dispatch(
      fetchCustomerList({ page: 1, search: debouncedSearch || undefined }),
    );
  }, [dispatch, debouncedSearch]);

  const mappedRows = useMemo(() => rawItems.map(customerApiToRow), [rawItems]);

  const itemCount = meta?.total ?? 0;
  const page = meta?.current_page ?? 1;
  const lastPage = Math.max(1, meta?.last_page ?? 1);

  const handleLoadMore = useCallback(() => {
    if (pendingLoadMoreRef.current || loading || refreshing || loadingMore || page >= lastPage) {
      return;
    }
    pendingLoadMoreRef.current = true;
    void dispatch(
      fetchCustomerList({ page: page + 1, append: true }),
    );
  }, [loading, refreshing, loadingMore, page, lastPage, dispatch]);

  const confirmDeleteCustomer = useCallback(
    async (row: CustomerListRow) => {
      const ok = await confirmDialog({
        title: 'Xóa khách hàng',
        message: `Xóa ${row.name}? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        destructive: true,
      });
      if (!ok) {
        return;
      }
      try {
        await deleteCustomer(row.id);
        await dispatch(
          fetchCustomerList({
            page: 1,
            search: debouncedSearch || undefined,
          }),
        ).unwrap();
        toast.success(`${row.name} đã được xóa khỏi danh sách.`);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      }
    },
    [dispatch, debouncedSearch],
  );

  const onViewRow = useCallback(
    (row: CustomerListRow) => {
      if (onOpenCustomer) {
        onOpenCustomer(row.id);
        return;
      }
      toast.info(
        [
          row.phoneLabel ? `Điện thoại: ${row.phoneLabel}` : null,
          row.emailLabel ? `Email: ${row.emailLabel}` : null,
          row.addressLabel ? `Địa chỉ: ${row.addressLabel}` : null,
          row.ordersCount > 0
            ? `Đơn hàng: ${row.ordersCount.toLocaleString('vi-VN')}`
            : null,
        ]
          .filter(Boolean)
          .join('\n') || row.name,
      );
    },
    [onOpenCustomer],
  );

  const renderItem = useCallback(
    ({ item }: { item: CustomerListRow }) => (
      <CustomerListMobileCard
        row={item}
        onView={() => onViewRow(item)}
        onDelete={() => void confirmDeleteCustomer(item)}
      />
    ),
    [onViewRow, confirmDeleteCustomer],
  );

  const keyExtractor = useCallback(
    (_item: CustomerListRow, index: number) => String(windowStart + index),
    [windowStart],
  );

  const listHeader = useMemo(
    () => (
      <>
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <CanvasListToolbarShell>
          <CustomersFilterToolbar
            query={query}
            onQueryChange={setQuery}
            onRefresh={onRefresh}
            refreshing={refreshing}
            primaryActionTitle={onCreateCustomer != null ? '+ Tạo KH' : undefined}
            onPrimaryAction={onCreateCustomer ?? undefined}
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
      </>
    ),
    [error, styles, query, onRefresh, refreshing, onCreateCustomer, itemCount, palette],
  );

  const listFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreFooter}>
          <ActivityIndicator size="small" color={palette.textSecondary} />
          <Text style={styles.loadMoreText}>Đang tải thêm…</Text>
        </View>
      );
    }
    if (mappedRows.length > 0 && meta != null && page >= lastPage) {
      return (
        <View style={styles.loadMoreFooter}>
          <Text style={styles.endOfListText}>Hết danh sách</Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, mappedRows.length, meta, page, lastPage, styles, palette]);

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

  const listBody = useTable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        canvasListScrollContent(),
        { paddingBottom: insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={memoizedRefreshControl}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        if (
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - 120
        ) {
          handleLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {listHeader}
      <CustomersTable
        rows={mappedRows}
        onView={onViewRow}
        onDelete={row => void confirmDeleteCustomer(row)}
      />
      {listFooter}
    </ScrollView>
  ) : (
    <FlatList
          data={mappedRows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.scroll}
          contentContainerStyle={[
            canvasListScrollContent(),
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate
        loading={loading}
        refreshing={refreshing}
        itemCount={mappedRows.length}
        withLeading={false}
      >
        {listBody}
      </ListLoadingGate>
    </View>
  );
}

function create_CustomersListScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    toolbarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    spacer: { flex: 1 },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createBtn: {
      backgroundColor: BRAND_HEX,
      borderColor: BRAND_HEX,
    },
    createBtnText: {
      color: ON_BRAND,
      fontWeight: '700',
    },
    errorText: {
      marginBottom: 10,
      fontSize: 13,
      color: c.red,
      fontWeight: '600',
    },
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 4,
      marginTop: 8,
    },
    listMeta: { fontSize: 11, maxWidth: '55%', textAlign: 'right' },
    loadMoreFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    loadMoreText: {
      fontSize: 13,
      color: c.textMuted,
    },
    endOfListText: {
      fontSize: 12,
      color: c.textMuted,
      textAlign: 'center',
    },
  });
}
