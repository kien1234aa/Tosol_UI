import React, { useCallback } from 'react';
import { NavigationIndependentTree } from '@react-navigation/core';
import {
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import type { AppRole } from '@features/auth/types/appRole';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import type { SalesBottomNavChromeVariant } from '@features/auth/utils/roleNavPolicy';
import type { SalesBottomTabId } from './salesBottomTabNav';
import { SalesBottomTabNavigator } from './SalesBottomTabNavigator';
import {
  salesRootNavigationRef,
  syncActiveSalesNavTabFromRootState,
} from './salesTabNavRefs';

export type SalesNavTreeProps = {
  theme: Theme;
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
 * Một `NavigationContainer` + bottom tabs (`rn-wave-bottom-bar`) — đổi tab giữ
 * stack, không remount cả cây. `tabBarHidden` để ẩn bar khi mở full-screen overlay.
 */
export const SalesNavTree = React.memo(function SalesNavTree({
  theme,
  appRole,
  visibleTabs,
  initialTab,
  onSelectTab,
  tabIcons,
  tabAccessibilityLabels,
  tabLabels,
  navVariant,
  tabBarHidden,
}: SalesNavTreeProps) {
  const onStateChange = useCallback(() => {
    syncActiveSalesNavTabFromRootState();
  }, []);

  return (
    <NavigationIndependentTree>
      <NavigationContainer
        ref={salesRootNavigationRef}
        theme={theme}
        onStateChange={onStateChange}
      >
        <SalesBottomTabNavigator
          appRole={appRole}
          visibleTabs={visibleTabs}
          initialTab={initialTab}
          onSelectTab={onSelectTab}
          tabIcons={tabIcons}
          tabAccessibilityLabels={tabAccessibilityLabels}
          tabLabels={tabLabels}
          navVariant={navVariant}
          tabBarHidden={tabBarHidden}
        />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
});
