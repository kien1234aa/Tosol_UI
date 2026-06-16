import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { PriceListDetailTabId } from './priceListDetailTypes';
import { PRICE_LIST_DETAIL_TABS } from './priceListDetailTypes';

export type PriceListDetailTabBarProps = {
  activeTab: PriceListDetailTabId;
  onSelectTab: (id: PriceListDetailTabId) => void;
};

export function PriceListDetailTabBar({
  activeTab,
  onSelectTab,
}: PriceListDetailTabBarProps) {
  const styles = useThemeStyleSheet(create_PriceListDetailTabBar_styles);
  const palette = useAppColors();

  return (
    <View style={styles.tabBarOuter}>
      <ScrollView
        horizontal
        style={styles.tabScroll}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.tabScrollInner}
      >
        {PRICE_LIST_DETAIL_TABS.map(tab => {
          const on = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectTab(tab.id)}
              style={[styles.tabChip, on && styles.tabChipOn]}
            >
              <View style={styles.tabIconSlot}>
                <SystemIcon
                  name={tab.icon}
                  size={15}
                  color={on ? palette.teal : palette.textMuted}
                />
              </View>
              <Text
                style={[styles.tabLabel, on && styles.tabTxtOn]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {on ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.tabChevSlot}>
        <SystemIcon name="chevronForward" size={18} color={palette.textMuted} />
      </View>
    </View>
  );
}

function create_PriceListDetailTabBar_styles(c: AppColorPalette) {
  return StyleSheet.create({
    tabBarOuter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.bgTabBar,
    },
    tabScroll: { flex: 1, minWidth: 0 },
    tabChevSlot: {
      width: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabScrollInner: {
      paddingHorizontal: 4,
      gap: 4,
      alignItems: 'flex-end',
      paddingBottom: 2,
    },
    tabChip: {
      position: 'relative',
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 10,
      marginHorizontal: 2,
      borderRadius: 10,
      alignItems: 'center',
      minWidth: 72,
    },
    tabChipOn: {
      backgroundColor: 'rgba(61,200,200,0.1)',
    },
    tabIconSlot: { marginBottom: 2, alignItems: 'center' },
    tabLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
      maxWidth: 96,
      textAlign: 'center',
    },
    tabTxtOn: { color: c.tealLight },
    tabUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 8,
      right: 8,
      height: 2,
      borderRadius: 1,
      backgroundColor: c.tealLight,
    },
  });
}
