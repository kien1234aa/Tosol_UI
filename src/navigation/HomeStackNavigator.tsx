import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/src/screens/home/HomeScreen';
import { AwaitingPaymentScreen } from '@/src/screens/orders/AwaitingPaymentScreen';
import { CreateConsignmentScreen } from '@/src/screens/consignment/CreateConsignmentScreen';
import { ConsignmentListScreen } from '@/src/screens/consignment/ConsignmentListScreen';
import { ConsignmentDetailScreen } from '@/src/screens/consignment/ConsignmentDetailScreen';
import { DeliveredConsignmentScreen } from '@/src/screens/consignment/DeliveredConsignmentScreen';
import { WalletScreen } from '@/src/screens/wallet/WalletScreen';
import { EstimateScreen } from '@/src/screens/estimate/EstimateScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * Nested stack for the Home tab. Flows opened from the dashboard (awaiting
 * deposit/payment, consignment create/list/detail) live here so the bottom tab
 * indicator stays on Home while navigating.
 */
export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AwaitingPayment" component={AwaitingPaymentScreen} />
      <Stack.Screen
        name="CreateConsignment"
        component={CreateConsignmentScreen}
      />
      <Stack.Screen name="ConsignmentList" component={ConsignmentListScreen} />
      <Stack.Screen
        name="ConsignmentDetail"
        component={ConsignmentDetailScreen}
      />
      <Stack.Screen
        name="DeliveredConsignment"
        component={DeliveredConsignmentScreen}
      />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Estimate" component={EstimateScreen} />
    </Stack.Navigator>
  );
}
