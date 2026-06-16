import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  ClipboardList,
  Home,
  Search,
  ShoppingCart,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { SearchStackNavigator } from './SearchStackNavigator';
import { OrdersStackNavigator } from './OrdersStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';
import { CartScreen } from '@/src/screens/cart/CartScreen';
import { HomeTabLogo } from '@/src/components/main/HomeTabLogo';
import { MainTabBar, mainTabBarStyle } from '@/src/components/main/WaveTabBar';
import { fontStyle } from '@/src/configs/theme/fonts';
import { mainTabCopy, tabBarColors, tabBarLayout } from '@/src/configs/main';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, LucideIcon> = {
  Search,
  Cart: ShoppingCart,
  Home,
  Orders: ClipboardList,
  Profile: User,
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Search: mainTabCopy.search,
  Cart: mainTabCopy.cart,
  Home: mainTabCopy.home,
  Orders: mainTabCopy.orders,
  Profile: mainTabCopy.profile,
};

/**
 * Main app shell after authentication. Tab order: Search → Cart → Home → Orders → Profile.
 * Uses `rn-wave-bottom-bar` for animated wave tab bar + floating active bubble.
 */
export function MainTabNavigator() {
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => <MainTabBar {...props} />,
    [],
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={({ route }) => {
        const Icon = TAB_ICONS[route.name];
        const label = TAB_LABELS[route.name];

        return {
          headerShown: false,
          tabBarLabel: label,
          tabBarActiveTintColor: tabBarColors.waveBackground,
          tabBarInactiveTintColor: tabBarColors.inactiveContent,
          tabBarActiveBackgroundColor: tabBarColors.waveBackground,
          tabBarLabelStyle: {
            color: tabBarColors.inactiveContent,
            fontSize: 11,
            ...fontStyle('semibold'),
            marginTop: 0,
          },
          tabBarStyle: mainTabBarStyle.tabBar,
          tabBarIcon: ({ focused, color, size }) => {
            const iconColor = focused
              ? tabBarColors.activeBubbleIcon
              : color ?? tabBarColors.inactiveContent;
            const iconSize = focused
              ? tabBarLayout.focusedIconSize
              : size ?? tabBarLayout.iconSize;

            return <Icon color={iconColor} size={iconSize} />;
          },
        };
      }}>
      <Tab.Screen name="Search" component={SearchStackNavigator} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <HomeTabLogo
              size={focused ? tabBarLayout.homeLogoSize : size ?? tabBarLayout.iconSize}
            />
          ),
        }}
      />
      <Tab.Screen name="Orders" component={OrdersStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
