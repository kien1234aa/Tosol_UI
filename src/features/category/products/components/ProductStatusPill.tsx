import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { statusPillPair } from '@shared/theme/statusColors';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
import type { ProductRowStatus } from '../productListTypes';

function productRowStatusSpec(
  p: AppColorPalette,
): Record<ProductRowStatus, { label: string; bg: string; color: string }> {
  const success = statusPillPair(p, 'success');
  const neutral = statusPillPair(p, 'neutral');
  return {
    active: { label: 'Hoạt động', ...success },
    inactive: { label: 'Ngưng', ...neutral },
  };
}

export function ProductStatusPill({ status }: { status: ProductRowStatus }) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ProductStatusPill_styles);
  const t = productRowStatusSpec(palette)[status];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.pillText, { color: t.color }]} numberOfLines={1}>
        {t.label}
      </Text>
    </View>
  );
}

function create_ProductStatusPill_styles(_c: AppColorPalette) {
  return StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      maxWidth: 120,
    },
    pillText: {
      fontSize: 11,
      fontWeight: '700',
    },
  });
}
