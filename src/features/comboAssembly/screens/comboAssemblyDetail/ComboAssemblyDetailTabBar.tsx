import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { ComboAssemblyDetailTabId } from './comboAssemblyDetailTypes';
import { COMBO_ASSEMBLY_DETAIL_TABS } from './comboAssemblyDetailTypes';

export type ComboAssemblyDetailTabBarProps = {
  tabs?: typeof COMBO_ASSEMBLY_DETAIL_TABS;
  activeTab: ComboAssemblyDetailTabId;
  materialsCount: number;
  onSelectTab: (id: ComboAssemblyDetailTabId) => void;
};

/** Tab dạng segment full-width — hợp mobile hơn thanh tab cuộn ngang. */
export function ComboAssemblyDetailTabBar({
  tabs = COMBO_ASSEMBLY_DETAIL_TABS,
  activeTab,
  materialsCount,
  onSelectTab,
}: ComboAssemblyDetailTabBarProps) {
  const styles = useThemeStyleSheet(create_ComboAssemblyDetailTabBar_styles);
  const palette = useAppColors();

  return (
    <View style={styles.wrap}>
      <View style={styles.segment}>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          let badge: string | null = null;
          if (tab.badgeFrom === 'materials' && materialsCount > 0) {
            badge = String(materialsCount);
          }
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectTab(tab.id)}
              style={({ pressed }) => [
                styles.segCell,
                index > 0 && styles.segCellBorder,
                isActive && styles.segCellActive,
                pressed && styles.segCellPressed,
              ]}
            >
              <SystemIcon
                name={tab.icon}
                size={16}
                color={isActive ? palette.teal : palette.textMuted}
              />
              <Text
                style={[styles.segLabel, isActive && styles.segLabelActive]}
                numberOfLines={2}
              >
                {tab.label}
              </Text>
              {badge ? (
                <View style={styles.segBadge}>
                  <Text style={styles.segBadgeTxt}>{badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function create_ComboAssemblyDetailTabBar_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    segment: {
      flexDirection: 'row',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
    },
    segCell: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 10,
      paddingHorizontal: 6,
      minHeight: 52,
    },
    segCellBorder: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: c.border,
    },
    segCellActive: {
      backgroundColor: 'rgba(61,200,200,0.14)',
    },
    segCellPressed: { opacity: 0.88 },
    segLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textSecondary,
      textAlign: 'center',
    },
    segLabelActive: { color: c.teal },
    segBadge: {
      marginTop: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    segBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
  });
}
