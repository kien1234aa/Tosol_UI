import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';

/** Thanh nhỏ khi refetch nền — list vẫn hiện (stale-while-revalidate). */
export function ListBackgroundRefreshBar() {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createListBackgroundRefreshBarStyles);

  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" color={palette.teal} />
      <Text style={[styles.label, { color: palette.textMuted }]}>
        {t('common.listRefreshing')}
      </Text>
    </View>
  );
}

function createListBackgroundRefreshBarStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
      marginBottom: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
