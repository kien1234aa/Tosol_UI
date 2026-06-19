import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deliveredOrdersCopy } from '@/src/configs/orders';
import { mainLayout } from '@/src/configs/main';
import { useDeliveredOrders } from '@/src/hooks/orders';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { OrdersStackScreenProps } from '@/src/navigation/types';
import type { DeliveredOrderItem } from '@/src/types/orders/deliveredOrders.types';
import { DeliveredOrderCard } from '@/src/components/orders';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type DeliveredOrdersScreenProps = OrdersStackScreenProps<'DeliveredOrders'>;

export function DeliveredOrdersScreen({
  navigation,
}: DeliveredOrdersScreenProps) {
  useFeatureInDevelopmentNotice();
  const { items } = useDeliveredOrders();

  const handleBack = useStackGoBack(navigation, 'OrdersMain');

  const renderItem = useCallback<ListRenderItem<DeliveredOrderItem>>(
    ({ item }) => <DeliveredOrderCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: DeliveredOrderItem) => item.id, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <StackHeader
            title={deliveredOrdersCopy.screenTitle}
            onPressBack={handleBack}
            backAccessibilityLabel={deliveredOrdersCopy.back}
          />

          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              items.length === 0 ? styles.emptyContent : styles.content
            }
            ItemSeparatorComponent={ListSeparator}
            ListEmptyComponent={
              <Center className="py-16">
                <Text size="md" className="text-center text-typography-500">
                  {deliveredOrdersCopy.empty}
                </Text>
              </Center>
            }
          />
        </VStack>
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
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  separator: {
    height: 12,
  },
});
