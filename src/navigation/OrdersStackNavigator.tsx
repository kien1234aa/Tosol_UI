import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersScreen } from '@/src/screens/orders/OrdersScreen';
import { OrderDetailScreen } from '@/src/screens/orders/OrderDetailScreen';
import { AwaitingDepositScreen } from '@/src/screens/orders/AwaitingDepositScreen';
import { DeliveredOrdersScreen } from '@/src/screens/orders/DeliveredOrdersScreen';
import type { OrdersStackParamList } from './types';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

/** Orders tab stack: order list → order detail. */
export function OrdersStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="AwaitingDeposit" component={AwaitingDepositScreen} />
      <Stack.Screen name="DeliveredOrders" component={DeliveredOrdersScreen} />
    </Stack.Navigator>
  );
}
