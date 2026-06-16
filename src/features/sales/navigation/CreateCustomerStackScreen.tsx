import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateCustomerScreen } from '../../category/customers/CreateCustomerScreen';
import type { SalesMainStackParamList } from './salesNavigationRef';

/** Khi rời màn tạo khách mở từ tạo đơn — hiện lại overlay tạo đơn (giữ state). */
export const SALES_RESUME_CREATE_ORDER_OVERLAY =
  'sales:resume-create-order-overlay';

type CreateCustomerNav = NativeStackNavigationProp<
  SalesMainStackParamList,
  'CreateCustomer'
>;
type CreateCustomerRoute = RouteProp<
  SalesMainStackParamList,
  'CreateCustomer'
>;

export function CreateCustomerStackScreen() {
  const navigation = useNavigation<CreateCustomerNav>();
  const { goBack, addListener } = navigation;
  const route = useRoute<CreateCustomerRoute>();

  useEffect(() => {
    const unsub = addListener('beforeRemove', () => {
      if (route.params?.fromCreateOrder) {
        DeviceEventEmitter.emit(SALES_RESUME_CREATE_ORDER_OVERLAY);
      }
    });
    return unsub;
  }, [addListener, route.params?.fromCreateOrder]);

  return (
    <CreateCustomerScreen
      onOpenDrawer={() => {}}
      onBack={goBack}
    />
  );
}
