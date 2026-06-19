import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  ClipboardList,
  FilePlus,
  Search,
  User,
} from 'lucide-react-native';
import { WaveBottomTabNavigator } from './WaveBottomTabNavigator';
import { SearchStackNavigator } from './SearchStackNavigator';
import { OrdersStackNavigator } from './OrdersStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';
import { CreateOrderStackNavigator } from './CreateOrderStackNavigator';
import { HomeTabLogo } from '@/src/components/main/HomeTabLogo';
import {
  mainTabCopy,
  tabBarLayout,
  waveBottomTabColorsForScheme,
} from '@/src/configs/main';

const TAB_IDS = ['search', 'createOrder', 'home', 'orders', 'profile'] as const;

/**
 * Main app shell after authentication.
 * Tab order: Search → CreateOrder → Home → Orders → Profile.
 */
export function MainTabNavigator() {
  const scheme = useColorScheme();
  const colors = useMemo(
    () => waveBottomTabColorsForScheme(scheme),
    [scheme],
  );

  const tabs = useMemo(
    () => [
      {
        id: 'search',
        routeName: 'Search',
        label: mainTabCopy.search,
        renderIcon: ({ color, size }: { color: string; size: number }) => (
          <Search color={color} size={size} />
        ),
        Screen: SearchStackNavigator,
      },
      {
        id: 'createOrder',
        routeName: 'CreateOrder',
        label: mainTabCopy.createOrder,
        renderIcon: ({ color, size }: { color: string; size: number }) => (
          <FilePlus color={color} size={size} />
        ),
        Screen: CreateOrderStackNavigator,
      },
      {
        id: 'home',
        routeName: 'Home',
        label: mainTabCopy.home,
        renderIcon: ({ focused, size }: { focused: boolean; size: number }) => (
          <HomeTabLogo
            size={
              focused ? tabBarLayout.homeLogoSize : size ?? tabBarLayout.iconSize
            }
          />
        ),
        Screen: HomeStackNavigator,
      },
      {
        id: 'orders',
        routeName: 'Orders',
        label: mainTabCopy.orders,
        renderIcon: ({ color, size }: { color: string; size: number }) => (
          <ClipboardList color={color} size={size} />
        ),
        Screen: OrdersStackNavigator,
      },
      {
        id: 'profile',
        routeName: 'Profile',
        label: mainTabCopy.profile,
        renderIcon: ({ color, size }: { color: string; size: number }) => (
          <User color={color} size={size} />
        ),
        Screen: ProfileStackNavigator,
      },
    ],
    [],
  );

  return (
    <WaveBottomTabNavigator
      tabs={tabs}
      colors={colors}
      visibleTabIds={[...TAB_IDS]}
      initialTabId="home"
    />
  );
}
