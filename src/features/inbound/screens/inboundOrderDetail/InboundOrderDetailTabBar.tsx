import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { InboundOrderDetailTabId } from './inboundOrderDetailTypes';
import { INBOUND_ORDER_DETAIL_TABS } from './inboundOrderDetailTypes';

export type InboundOrderDetailTabBarProps = {
  tabs?: typeof INBOUND_ORDER_DETAIL_TABS;
  activeTab: InboundOrderDetailTabId;
  inboundLineCount: number;
  poLineCount: number;
  onSelectTab: (id: InboundOrderDetailTabId) => void;
};

export function InboundOrderDetailTabBar({
  tabs = INBOUND_ORDER_DETAIL_TABS,
  activeTab,
  inboundLineCount,
  poLineCount,
  onSelectTab,
}: InboundOrderDetailTabBarProps) {
  const styles = useThemeStyleSheet(create_InboundOrderDetailTabBar_styles);
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
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          let badge: string | null = null;
          if (tab.badgeFrom === 'inbound_lines' && inboundLineCount > 0) {
            badge = String(inboundLineCount);
          }
          if (tab.badgeFrom === 'po_lines' && poLineCount > 0) {
            badge = String(poLineCount);
          }
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectTab(tab.id)}
              style={[styles.tabChip, isActive && styles.tabChipOn]}
            >
              <View style={styles.tabIconSlot}>
                <SystemIcon
                  name={tab.icon}
                  size={15}
                  color={isActive ? palette.teal : palette.textMuted}
                />
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabTxtOn]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {badge ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeTxt}>{badge}</Text>
                </View>
              ) : null}
              {isActive ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function create_InboundOrderDetailTabBar_styles(c: AppColorPalette) {
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
    tabBadge: {
      position: 'absolute',
      top: 4,
      right: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
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
