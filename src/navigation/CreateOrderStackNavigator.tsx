import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateOrderListScreen } from '@/src/screens/createOrder/CreateOrderListScreen';
import { CreateOrderScreen } from '@/src/screens/createOrder/CreateOrderScreen';
import type { CreateOrderStackParamList } from './types';

const Stack = createNativeStackNavigator<CreateOrderStackParamList>();

/** Create-order tab stack: draft list → draft editor. */
export function CreateOrderStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="CreateOrderList" component={CreateOrderListScreen} />
      <Stack.Screen name="CreateOrderEdit" component={CreateOrderScreen} />
    </Stack.Navigator>
  );
}
