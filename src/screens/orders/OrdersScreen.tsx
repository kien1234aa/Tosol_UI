import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mainLayout } from '@/src/configs/main';
import { ordersCopy } from '@/src/configs/orders';
import { EMPTY_ORDER_ADVANCED_FILTERS } from '@/src/configs/orders/orderFilters.constants';
import { lightTokens } from '@/src/configs/theme';
import { useOrderCancel, useOrderEdit, useOrdersList } from '@/src/hooks/orders';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import type { OrdersStackScreenProps } from '@/src/navigation/types';
import { setOrderListFilters } from '@/src/redux/orders';
import type { OrderListItem } from '@/src/types/orders/orders.types';
import {
  OrderAdvancedFilterModal,
  OrderCancelReasonModal,
  OrderEditModal,
  OrderListCard,
  OrdersListHeader,
  OrdersCustomerSearchBar,
} from '@/src/components/orders';
import { ListLoadingGate } from '@/src/shared/components/ui/ListLoadingGate';
import { ListScreenSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

type OrdersScreenProps = OrdersStackScreenProps<'OrdersMain'>;

export function OrdersScreen({ navigation, route }: OrdersScreenProps) {
  const dispatch = useAppDispatch();
  const { horizontalPadding, contentMaxWidth, isTablet } = useResponsiveLayout();

  useLayoutEffect(() => {
    const status = route.params?.status?.trim();

    if (!status) {
      return;
    }

    dispatch(
      setOrderListFilters({
        ...EMPTY_ORDER_ADVANCED_FILTERS,
        status,
      }),
    );
    navigation.setParams({ status: undefined });
  }, [dispatch, navigation, route.params?.status]);

  const {
    orders,
    listFilters,
    customerQuery,
    customerResults,
    selectedCustomerName,
    isSearchingCustomers,
    customerSearchError,
    isFilterOpen,
    emptyMessage,
    isLoading,
    isLoadingMore,
    loadError,
    onOpenFilter,
    onCloseFilter,
    onApplyFilters,
    onSearchChange,
    onSelectCustomer,
    onClearCustomer,
    onRemoveOrder: _onRemoveOrder,
    onOrderAction: _onOrderAction,
    reloadOrders,
    loadMoreOrders,
  } = useOrdersList();

  const {
    isVisible: isCancelVisible,
    orderNumber: cancelOrderNumber,
    reason: cancelReason,
    isSubmitting: isCancelling,
    error: cancelError,
    openCancel,
    closeCancel,
    onChangeReason: onChangeCancelReason,
    confirmCancel,
  } = useOrderCancel({ onSuccess: reloadOrders });

  const {
    isVisible: isEditVisible,
    orderNumber: editOrderNumber,
    note: editNote,
    isSubmitting: isEditing,
    error: editError,
    openEdit,
    closeEdit,
    onChangeNote: onChangeEditNote,
    confirmEdit,
  } = useOrderEdit({ onSuccess: reloadOrders });

  const handleRemoveOrder = useCallback(
    (orderId: string) => {
      openCancel(orderId);
    },
    [openCancel],
  );

  const handleViewOrder = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetail', { orderId });
    },
    [navigation],
  );

  const handleOrderAction = useCallback(
    (orderId: string, action: 'view' | 'edit' | 'pay' | 'cancel') => {
      if (action === 'view') {
        handleViewOrder(orderId);
        return;
      }

      if (action === 'edit') {
        openEdit(orderId);
        return;
      }

      if (action === 'cancel') {
        openCancel(orderId);
        return;
      }

      _onOrderAction(orderId, action);
    },
    [handleViewOrder, openCancel, openEdit, _onOrderAction],
  );

  const renderItem = useCallback<ListRenderItem<OrderListItem>>(
    ({ item }) => (
      <OrderListCard
        order={item}
        onPress={handleViewOrder}
        onRemove={handleRemoveOrder}
        onAction={handleOrderAction}
      />
    ),
    [handleOrderAction, handleViewOrder, handleRemoveOrder],
  );

  const keyExtractor = useCallback(
    (item: OrderListItem) => item.orderNumber || item.uuid,
    [],
  );

  const handleEndReached = useCallback(() => {
    loadMoreOrders();
  }, [loadMoreOrders]);

  const listEmptyComponent = useCallback(() => {
    if (loadError) {
      return (
        <Center className="px-4 py-16">
          <Text size="sm" className="mb-3 text-center text-error-500">
            {loadError}
          </Text>
          <Pressable onPress={reloadOrders} accessibilityRole="button">
            <Text size="sm" className="font-semibold text-tertiary-600">
              {ordersCopy.retry}
            </Text>
          </Pressable>
        </Center>
      );
    }

    return (
      <Center className="py-16">
        <Text size="md" className="text-center text-typography-500">
          {emptyMessage}
        </Text>
      </Center>
    );
  }, [emptyMessage, loadError, reloadOrders]);

  const listFooterComponent = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <Center className="py-4">
        <ActivityIndicator color={lightTokens.tertiary600} size="small" />
        <Text size="xs" className="mt-2 text-typography-500">
          {ordersCopy.loadingMoreOrders}
        </Text>
      </Center>
    );
  }, [isLoadingMore]);

  const listSkeleton = useMemo(
    () => (
      <ListScreenSkeleton
        count={5}
        showSectionHeader={false}
        withLeading
        hasDetail
        style={[
          styles.skeletonContent,
          { paddingHorizontal: horizontalPadding },
        ]}
      />
    ),
    [horizontalPadding],
  );

  const listContentStyle = useMemo(
    () => [
      styles.content,
      {
        paddingHorizontal: horizontalPadding,
        maxWidth: isTablet ? contentMaxWidth.screen : undefined,
        alignSelf: isTablet ? ('center' as const) : undefined,
        width: isTablet ? ('100%' as const) : undefined,
      },
    ],
    [horizontalPadding, isTablet, contentMaxWidth.screen],
  );

  const emptyContentStyle = useMemo(
    () => [
      styles.emptyContent,
      { paddingHorizontal: horizontalPadding },
    ],
    [horizontalPadding],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isLoading && orders.length > 0}
        onRefresh={reloadOrders}
        tintColor={lightTokens.tertiary600}
      />
    ),
    [isLoading, orders.length, reloadOrders],
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <OrdersListHeader onPressFilter={onOpenFilter} />
        <OrdersCustomerSearchBar
          query={customerQuery}
          selectedCustomerName={selectedCustomerName}
          results={customerResults}
          isSearching={isSearchingCustomers}
          searchError={customerSearchError}
          onChangeQuery={onSearchChange}
          onSelectCustomer={onSelectCustomer}
          onClearCustomer={onClearCustomer}
        />

        <ListLoadingGate
          loading={isLoading}
          refreshing={isLoading && orders.length > 0}
          itemCount={orders.length}
          options={{ canShowSkeleton: !loadError }}
          skeleton={listSkeleton}>
          <FlatList
            data={orders}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              orders.length === 0 ? emptyContentStyle : listContentStyle
            }
            ItemSeparatorComponent={ListSeparator}
            ListEmptyComponent={listEmptyComponent}
            ListFooterComponent={listFooterComponent}
            refreshControl={refreshControl}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
          />
        </ListLoadingGate>

        <OrderAdvancedFilterModal
          visible={isFilterOpen}
          appliedFilters={listFilters}
          onClose={onCloseFilter}
          onApply={onApplyFilters}
        />

        <OrderCancelReasonModal
          visible={isCancelVisible}
          orderNumber={cancelOrderNumber}
          reason={cancelReason}
          isSubmitting={isCancelling}
          error={cancelError}
          onChangeReason={onChangeCancelReason}
          onClose={closeCancel}
          onConfirm={confirmCancel}
        />

        <OrderEditModal
          visible={isEditVisible}
          orderNumber={editOrderNumber}
          note={editNote}
          isSubmitting={isEditing}
          error={editError}
          onChangeNote={onChangeEditNote}
          onClose={closeEdit}
          onConfirm={confirmEdit}
        />
      </SafeAreaView>
    </Box>
  );
}

function ListSeparator() {
  return <Box style={styles.separator} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  emptyContent: {
    flexGrow: 1,
  },
  skeletonContent: {
    flex: 1,
    paddingTop: 12,
  },
  separator: {
    height: 12,
  },
});
