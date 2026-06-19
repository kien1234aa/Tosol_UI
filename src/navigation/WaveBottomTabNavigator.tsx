import React, { memo, useCallback, useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { WaveTabBar } from '@/src/components/main/WaveTabBar';
import { useTabHaptics } from '@/src/hooks/common/useTabHaptics';
import { type WaveBottomTabColors } from '@/src/configs/main';

const Tab = createBottomTabNavigator();

export type { WaveBottomTabColors } from '@/src/configs/main';

export type WaveTabIconArgs = {
  focused: boolean;
  color: string;
  size: number;
};

export type WaveTabDef = {
  id: string;
  routeName?: string;
  label?: string;
  accessibilityLabel?: string;
  renderIcon: (args: WaveTabIconArgs) => React.ReactNode;
  Screen: React.ComponentType;
};

export type WaveBottomTabNavigatorProps = {
  tabs: WaveTabDef[];
  colors: WaveBottomTabColors;
  visibleTabIds?: string[];
  initialTabId?: string;
  onSelectTab?: (tabId: string) => void;
  tabBarHidden?: boolean;
  onTabPress?: (tabId: string) => void;
};

function defaultRouteName(tabId: string): string {
  return `Tab_${tabId}`;
}

function WaveBottomTabNavigatorComponent({
  tabs,
  colors,
  visibleTabIds,
  initialTabId,
  onSelectTab,
  tabBarHidden,
  onTabPress,
}: WaveBottomTabNavigatorProps) {
  const { triggerTabHaptic } = useTabHaptics();

  const orderedVisible = useMemo(() => {
    if (!visibleTabIds) {
      return tabs;
    }
    const visibleSet = new Set(visibleTabIds);
    return tabs.filter(tab => visibleSet.has(tab.id));
  }, [tabs, visibleTabIds]);

  const routeNameOf = useCallback(
    (tabId: string) =>
      orderedVisible.find(tab => tab.id === tabId)?.routeName ??
      defaultRouteName(tabId),
    [orderedVisible],
  );

  const initialRouteName = useMemo(() => {
    const hasInitial =
      initialTabId != null && orderedVisible.some(tab => tab.id === initialTabId);
    const targetId = hasInitial ? initialTabId : orderedVisible[0]?.id;
    return targetId ? routeNameOf(targetId) : undefined;
  }, [initialTabId, orderedVisible, routeNameOf]);

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => {
      if (tabBarHidden) {
        return null;
      }
      return <WaveTabBar {...props} />;
    },
    [tabBarHidden],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      lazy: false,
      freezeOnBlur: false,
      popToTopOnBlur: true,
      tabBarActiveTintColor: colors.activeTint,
      tabBarInactiveTintColor: colors.inactiveTint,
      tabBarActiveBackgroundColor: colors.activeBackground,
      tabBarShowLabel: false,
      tabBarItemStyle: {
        backgroundColor: 'transparent',
      },
      tabBarStyle: {
        backgroundColor: 'transparent',
        elevation: 0,
      },
    }),
    [colors.activeBackground, colors.activeTint, colors.inactiveTint],
  );

  const handleTabPress = useCallback(
    (tabId: string) => {
      if (onTabPress) {
        onTabPress(tabId);
      } else {
        triggerTabHaptic();
      }
      onSelectTab?.(tabId);
    },
    [onTabPress, onSelectTab, triggerTabHaptic],
  );

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      tabBar={renderTabBar}
      screenOptions={screenOptions}>
      {orderedVisible.map(tab => {
        const a11yLabel = tab.accessibilityLabel ?? tab.label ?? tab.id;

        return (
          <Tab.Screen
            key={tab.id}
            name={tab.routeName ?? defaultRouteName(tab.id)}
            listeners={{
              tabPress: () => handleTabPress(tab.id),
            }}
            options={{
              tabBarAccessibilityLabel: a11yLabel,
              tabBarLabel: tab.label,
              tabBarIcon: ({ focused, color }) =>
                tab.renderIcon({
                  focused,
                  color: color ?? colors.inactiveTint,
                  size: focused ? 26 : 24,
                }),
            }}
            component={tab.Screen}
          />
        );
      })}
    </Tab.Navigator>
  );
}

export const WaveBottomTabNavigator = memo(WaveBottomTabNavigatorComponent);
