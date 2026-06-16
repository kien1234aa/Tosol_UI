import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { INVOICE_DETAIL_TABS } from './invoiceDetailTypes';
import type { InvoiceDetailTabId } from './invoiceDetailTypes';

export type InvoiceDetailTabBarProps = {
  tabs?: typeof INVOICE_DETAIL_TABS;
  activeTab: InvoiceDetailTabId;
  itemCount: number;
  onSelectTab: (id: InvoiceDetailTabId) => void;
};

export function InvoiceDetailTabBar({
  tabs = INVOICE_DETAIL_TABS,
  activeTab,
  itemCount,
  onSelectTab,
}: InvoiceDetailTabBarProps) {
  const styles = useThemeStyleSheet(create_InvoiceDetailTabBar_styles);
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
          const on = tab.id === activeTab;
          const badge =
            tab.badgeFrom === 'items' && itemCount > 0
              ? String(itemCount)
              : null;
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
              {badge ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeTxt}>{badge}</Text>
                </View>
              ) : null}
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

function create_InvoiceDetailTabBar_styles(c: AppColorPalette) {
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
      backgroundColor: 'rgba(45,212,191,0.08)',
    },
    tabIconSlot: { marginBottom: 2, alignItems: 'center' },
    tabLabel: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    tabTxtOn: { color: c.tealLight },
    tabBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.cyan,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#0f172a' },
    tabUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 10,
      right: 10,
      height: 2,
      borderRadius: 2,
      backgroundColor: c.tealLight,
    },
  });
}
