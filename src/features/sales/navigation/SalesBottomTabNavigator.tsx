import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomFabBar } from 'rn-wave-bottom-bar';
import type { AppRole } from '@features/auth/types/appRole';
import { SystemIcon, type SystemIconName } from '@shared/components/icons/SystemIcon';
import { BRAND_HEX, BRAND_HEX_LIGHT, ON_BRAND } from '@shared/theme/designTokens';
import { useThemeMode } from '@shared/theme/ThemeContext';
import type { SalesBottomNavChromeVariant } from '@features/auth/utils/roleNavPolicy';
import {
  SALES_BOTTOM_TAB_ORDER,
  type SalesBottomTabId,
} from './salesBottomTabNav';
import {
  SALES_BOTTOM_TAB_ROUTE_NAMES,
  salesBottomTabRouteName,
  type SalesBottomTabParamList,
} from './salesBottomTabRoutes';
import { SalesTabStack } from './SalesTabStack';
import { useTabHaptics } from '../components/useTabHaptics';

const Tab = createBottomTabNavigator<SalesBottomTabParamList>();

const DEFAULT_TAB_ICONS: Record<SalesBottomTabId, SystemIconName> = {
  orders: 'cart',
  catalog: 'grid',
  goods: 'layers',
  finance: 'wallet',
};

/** Nền quả bóng FAB — sáng hơn wave brand một chút (cả light & dark). */
function tabBarBubbleBackgroundColor(): string {
  return BRAND_HEX_LIGHT;
}

/** Màu wave bar — brand vàng, đồng bộ header & light mode. */
function tabBarWaveBackgroundColor(): string {
  return BRAND_HEX;
}

const BOTTOM_BAR_CONTAINER_STYLE = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  overflow: 'visible' as const,
};

/** Wave/FAB tab bar — chậm hơn mặc định lib (stiffness 250). */
const TAB_BAR_SPRING_CONFIG = {
  damping: 38,
  mass: 1.15,
  stiffness: 90,
} as const;

export type SalesBottomTabNavigatorProps = {
  appRole: AppRole;
  visibleTabs: SalesBottomTabId[];
  initialTab: SalesBottomTabId;
  onSelectTab: (tab: SalesBottomTabId) => void;
  tabIcons?: Record<SalesBottomTabId, SystemIconName>;
  tabAccessibilityLabels?: Partial<Record<SalesBottomTabId, string>>;
  tabLabels?: Partial<Record<SalesBottomTabId, string>>;
  navVariant?: SalesBottomNavChromeVariant;
  tabBarHidden?: boolean;
};

/**
 * Bottom tab navigator dùng `rn-wave-bottom-bar` (`BottomFabBar`) trên
 * `@react-navigation/bottom-tabs`:
 *  - FAB nổi theo tab đang focus (animated wave shape giữa các tab).
 *  - FAB active dùng `BRAND_HEX`; icon + nhãn tab inactive theo palette theme.
 *  - Haptics gắn qua `tabPress` listener (giữ hành vi cũ).
 *  - `tabBarHidden` ẩn cả bar khi mở full-screen overlay (thay cho `setVisible`).
 */
export const SalesBottomTabNavigator = React.memo(
  function SalesBottomTabNavigator({
    appRole,
    visibleTabs,
    initialTab,
    onSelectTab,
    tabIcons,
    tabAccessibilityLabels,
    tabLabels,
    tabBarHidden,
  }: SalesBottomTabNavigatorProps) {
    const { mode } = useThemeMode();
    const { triggerTabHaptic } = useTabHaptics();
    /** Icon/nhãn tab không focus — chữ tối trên nền brand (giống header). */
    const tabBarInactiveContentColor = ON_BRAND;

    const icons = useMemo(
      () => ({ ...DEFAULT_TAB_ICONS, ...tabIcons }),
      [tabIcons],
    );

    const visibleSet = useMemo(() => new Set(visibleTabs), [visibleTabs]);
    const orderedVisible = useMemo(
      () => SALES_BOTTOM_TAB_ORDER.filter(t => visibleSet.has(t)),
      [visibleSet],
    );

    const initialRouteName = salesBottomTabRouteName(
      orderedVisible.includes(initialTab)
        ? initialTab
        : orderedVisible[0] ?? 'orders',
    );

    const focusedButtonStyle = useMemo(
      () => ({
        backgroundColor: tabBarBubbleBackgroundColor(),
      }),
      [],
    );

    const renderTabBar = useCallback(
      (props: BottomTabBarProps) => {
        if (tabBarHidden) {
          return null;
        }
        return (
          <BottomFabBar
            mode="default"
            isRtl={false}
            focusedButtonStyle={focusedButtonStyle}
            bottomBarContainerStyle={BOTTOM_BAR_CONTAINER_STYLE}
            springConfig={TAB_BAR_SPRING_CONFIG}
            {...props}
          />
        );
      },
      [focusedButtonStyle, tabBarHidden],
    );

    const screenOptions = useMemo(
      () => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarActiveTintColor: BRAND_HEX_LIGHT,
        tabBarInactiveTintColor: tabBarInactiveContentColor,
        tabBarActiveBackgroundColor: tabBarWaveBackgroundColor(),
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor:
            mode === 'dark' ? 'rgba(44,36,22,0.35)' : 'rgba(44,36,22,0.12)',
        },
      }),
      [tabBarInactiveContentColor, mode],
    );

    return (
      <Tab.Navigator
        initialRouteName={initialRouteName}
        tabBar={renderTabBar}
        screenOptions={screenOptions}
      >
        {orderedVisible.map(tabId => {
          const iconName = icons[tabId];
          const a11yLabel =
            tabAccessibilityLabels?.[tabId] ?? tabLabels?.[tabId] ?? tabId;
          return (
            <Tab.Screen
              key={tabId}
              name={SALES_BOTTOM_TAB_ROUTE_NAMES[tabId]}
              listeners={{
                tabPress: () => {
                  triggerTabHaptic();
                  onSelectTab(tabId);
                },
              }}
              options={{
                tabBarAccessibilityLabel: a11yLabel,
                tabBarLabel: tabLabels?.[tabId],
                tabBarLabelStyle: { color: tabBarInactiveContentColor },
                tabBarIcon: ({ focused, color }) => (
                  <SystemIcon
                    name={iconName}
                    size={focused ? 26 : 24}
                    color={
                      focused
                        ? ON_BRAND
                        : (color ?? tabBarInactiveContentColor)
                    }
                  />
                ),
              }}
            >
              {() => <SalesTabStack tabId={tabId} appRole={appRole} />}
            </Tab.Screen>
          );
        })}
      </Tab.Navigator>
    );
  },
);
