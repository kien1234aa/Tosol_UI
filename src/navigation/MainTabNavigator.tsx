import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  ClipboardList,
  Home,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react-native';
import { mainTabCopy, mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import { SearchStackNavigator } from './SearchStackNavigator';
import { OrdersStackNavigator } from './OrdersStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { CartScreen } from '@/src/screens/cart/CartScreen';
import { HomeScreen } from '@/src/screens/home/HomeScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 22;

/**
 * Main app shell after authentication. Tab order: Search → Cart → Home → Orders → Profile.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTokens.tertiary500,
        tabBarInactiveTintColor: lightTokens.typography500,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: mainTabCopy.search,
          tabBarIcon: ({ color, size }) => (
            <Search color={color} size={size ?? TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: mainTabCopy.cart,
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart color={color} size={size ?? TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: mainTabCopy.home,
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size ?? TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{
          tabBarLabel: mainTabCopy.orders,
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size ?? TAB_ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: mainTabCopy.profile,
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size ?? TAB_ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: lightTokens.background0,
    borderTopColor: lightTokens.outline100,
    borderTopWidth: 1,
    minHeight: mainLayout.tabBarHeight,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
