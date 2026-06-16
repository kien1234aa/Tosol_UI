import React, { useEffect } from 'react';
import { NavigationIndependentTree } from '@react-navigation/core';
import { NavigationContainer, type Theme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import type { AppRole } from '@features/auth/types/appRole';
import type { SalesBottomTabId } from './salesBottomTabNav';
import { SalesTabStack } from './SalesTabStack';
import { salesTabNavRefs, setActiveSalesNavTab } from './salesTabNavRefs';

export type SalesMultiTabHostProps = {
  theme: Theme;
  activeTab: SalesBottomTabId;
  visibleTabs: SalesBottomTabId[];
  appRole: AppRole;
};

/**
 * Chỉ mount **một** NavigationContainer (tab đang chọn) — giảm lag so với 5 cây chạy ẩn.
 */
export const SalesMultiTabHost = React.memo(function SalesMultiTabHost({
  theme,
  activeTab,
  appRole,
}: SalesMultiTabHostProps) {
  useEffect(() => {
    setActiveSalesNavTab(activeTab);
  }, [activeTab]);

  return (
    <View style={styles.host} collapsable={false}>
      <NavigationIndependentTree>
        <NavigationContainer
          ref={salesTabNavRefs[activeTab]}
          theme={theme}
        >
          <SalesTabStack tabId={activeTab} appRole={appRole} />
        </NavigationContainer>
      </NavigationIndependentTree>
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});
