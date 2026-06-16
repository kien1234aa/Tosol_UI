import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mainLayout } from '@/src/configs/main';
import { useOrdersList } from '@/src/hooks/orders';
import type { OrdersStackScreenProps } from '@/src/navigation/types';
import type { OrderListItem } from '@/src/types/orders/orders.types';
import {
  OrderFilterSheet,
  OrderListCard,
  OrdersListHeader,
} from '@/src/components/orders';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';

type OrdersScreenProps = OrdersStackScreenProps<'OrdersMain'>;

export function OrdersScreen({ navigation }: OrdersScreenProps) {
  const {
    orders,
    statusFilter,
    isFilterOpen,
    filterOptions,
    emptyMessage,
    onOpenFilter,
    onCloseFilter,
    onSelectFilter,
    onRemoveOrder,
    onOrderAction,
  } = useOrdersList();

  const handleViewOrder = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetail', { orderId });
    },
    [navigation],
  );

  const handleOrderAction = useCallback(
    (orderId: string, action: 'view' | 'pay' | 'cancel') => {
      if (action === 'view') {
        handleViewOrder(orderId);
        return;
      }
      onOrderAction(orderId, action);
    },
    [handleViewOrder, onOrderAction],
  );

  const renderItem = useCallback<ListRenderItem<OrderListItem>>(
    ({ item }) => (
      <OrderListCard
        order={item}
        onPress={handleViewOrder}
        onRemove={onRemoveOrder}
        onAction={handleOrderAction}
      />
    ),
    [handleOrderAction, handleViewOrder, onRemoveOrder],
  );

  const keyExtractor = useCallback((item: OrderListItem) => item.id, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <OrdersListHeader onPressFilter={onOpenFilter} />

        <FlatList
          data={orders}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            orders.length === 0 ? styles.emptyContent : styles.content
          }
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={
            <Center className="py-16">
              <Text size="md" className="text-center text-typography-500">
                {emptyMessage}
              </Text>
            </Center>
          }
        />

        <OrderFilterSheet
          visible={isFilterOpen}
          options={filterOptions}
          selectedFilter={statusFilter}
          onClose={onCloseFilter}
          onSelect={onSelectFilter}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabBarHeight + 24,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
});
