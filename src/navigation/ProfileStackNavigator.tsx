import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/src/screens/profile/ProfileScreen';
import { PersonalInfoScreen } from '@/src/screens/profile/PersonalInfoScreen';
import { ChangePasswordScreen } from '@/src/screens/profile/ChangePasswordScreen';
import { StaffListScreen } from '@/src/screens/profile/StaffListScreen';
import { StaffDetailScreen } from '@/src/screens/profile/StaffDetailScreen';
import { ProductListScreen } from '@/src/screens/profile/ProductListScreen';
import { CreateProductScreen } from '@/src/screens/profile/CreateProductScreen';
import { EditProductScreen } from '@/src/screens/profile/EditProductScreen';
import { ProfileProductDetailScreen } from '@/src/screens/profile/ProfileProductDetailScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Profile tab stack: profile home → personal info / change password. */
export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="StaffList" component={StaffListScreen} />
      <Stack.Screen name="StaffDetail" component={StaffDetailScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProfileProductDetailScreen} />
    </Stack.Navigator>
  );
}
