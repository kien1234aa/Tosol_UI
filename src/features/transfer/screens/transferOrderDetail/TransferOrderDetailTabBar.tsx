import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { TransferOrderDetailTabId } from './transferOrderDetailTypes';
import { TRANSFER_ORDER_DETAIL_TABS } from './transferOrderDetailTypes';

export type TransferOrderDetailTabBarProps = {
  tabs?: typeof TRANSFER_ORDER_DETAIL_TABS;
  activeTab: TransferOrderDetailTabId;
  outboundCount: number;
  boxCount: number;
  inboundCount: number;
  onSelectTab: (id: TransferOrderDetailTabId) => void;
};

export function TransferOrderDetailTabBar({
  tabs = TRANSFER_ORDER_DETAIL_TABS,
  activeTab,
  outboundCount,
  boxCount,
  inboundCount,
  onSelectTab,
}: TransferOrderDetailTabBarProps) {
  const styles = useThemeStyleSheet(create_TransferOrderDetailTabBar_styles);
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
          if (tab.badgeFrom === 'outbound' && outboundCount > 0) {
            badge = String(outboundCount);
          }
          if (tab.badgeFrom === 'boxes' && boxCount > 0) {
            badge = String(boxCount);
          }
          if (tab.badgeFrom === 'inbound' && inboundCount > 0) {
            badge = String(inboundCount);
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

function create_TransferOrderDetailTabBar_styles(c: AppColorPalette) {
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
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 10,
      marginHorizontal: 2,
      borderRadius: 10,
      alignItems: 'center',
      minWidth: 68,
    },
    tabChipOn: {
      backgroundColor: 'rgba(61,200,200,0.1)',
    },
    tabIconSlot: { marginBottom: 2, alignItems: 'center' },
    tabLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textSecondary,
      maxWidth: 108,
      textAlign: 'center',
    },
    tabTxtOn: { color: c.tealLight },
    tabBadge: {
      position: 'absolute',
      top: 4,
      right: 0,
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
      left: 6,
      right: 6,
      height: 2,
      borderRadius: 1,
      backgroundColor: c.tealLight,
    },
  });
}
