import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderDetailCopy } from '@/src/configs/orders';
import {
  OrderDetailActions,
  OrderDetailCostBreakdown,
  OrderDetailHeader,
  OrderDetailNote,
  OrderDetailOptions,
  OrderDetailProducts,
  OrderDetailSummary,
} from '@/src/components/orders/OrderDetailView';
import { useOrderDetail } from '@/src/hooks/orders';
import type { OrdersStackScreenProps } from '@/src/navigation/types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type OrderDetailScreenProps = OrdersStackScreenProps<'OrderDetail'>;

export function OrderDetailScreen({
  navigation,
  route,
}: OrderDetailScreenProps) {
  const { orderId } = route.params;
  const { order, canPay, canCancel } = useOrderDetail(orderId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePay = useCallback(() => {
    Alert.alert(orderDetailCopy.paySuccess);
  }, []);

  const handleCancel = useCallback(() => {
    Alert.alert(orderDetailCopy.cancelSuccess);
  }, []);

  if (!order) {
    return (
      <Box className="flex-1 bg-background-50">
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <VStack className="flex-1">
            <OrderDetailHeader onPressBack={handleBack} />
            <Center className="flex-1 px-4">
              <Text size="md" className="text-center text-typography-500">
                {orderDetailCopy.notFound}
              </Text>
            </Center>
          </VStack>
        </SafeAreaView>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <OrderDetailHeader onPressBack={handleBack} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <VStack className="w-full" space="md">
              <OrderDetailSummary order={order} />
              <OrderDetailProducts products={order.products} />
              <OrderDetailOptions
                insurance={order.insurance}
                woodPacking={order.woodPacking}
              />
              <OrderDetailNote note={order.note} />
              <OrderDetailCostBreakdown order={order} />
            </VStack>
          </ScrollView>

          <OrderDetailActions
            canPay={canPay}
            canCancel={canCancel}
            remainingVnd={order.costs.remainingVnd}
            onPressPay={handlePay}
            onPressCancel={handleCancel}
          />
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
