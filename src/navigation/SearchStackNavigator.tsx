import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchScreen } from '@/src/screens/search/SearchScreen';
import { ProductDetailScreen } from '@/src/screens/search/ProductDetailScreen';
import type { SearchStackParamList } from './types';

const Stack = createNativeStackNavigator<SearchStackParamList>();

/** Search tab stack: product list → product detail. */
export function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
