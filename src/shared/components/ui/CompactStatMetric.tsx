import React, { type ReactNode } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { elevatedCard } from '../../theme/surfaceStyles';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { BRAND_HEX, RADIUS } from '../../theme/designTokens';

export type CompactStatMetricTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';

export type CompactStatMetricProps = {
  value: ReactNode;
  label: string;
  tone?: CompactStatMetricTone;
  /** Viền brand 2px khi đang chọn (ô lọc thống kê). */
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Hàng chứa nhiều `CompactStatMetric` — một dãy ngang, các ô co giãn đều (không lưới 2 cột).
 */
export const compactStatMetricRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    marginBottom: 10,
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});

/**
 * Ô số liệu gọn dùng trong hàng thống kê (xem `compactStatMetricRowStyles`).
 */
export function CompactStatMetric({
  value,
  label,
  tone = 'neutral',
  selected,
  onPress,
  style,
}: CompactStatMetricProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createCompactStatMetricStyles);

  const valueColor =
    tone === 'success'
      ? c.green
      : tone === 'danger'
      ? c.red
      : tone === 'info'
      ? c.textLink
      : tone === 'warning'
      ? c.orange
      : c.textPrimary;

  const cardStyle = [
    styles.card,
    elevatedCard(c, mode),
    selected && {
      borderWidth: 2,
      borderColor: BRAND_HEX,
    },
    style,
  ];

  const inner = (
    <View style={styles.inner}>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );

  if (onPress != null) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.92 }]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{inner}</View>;
}

function createCompactStatMetricStyles(c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: RADIUS.md,
      minWidth: 0,
      flex: 1,
      overflow: 'hidden',
    },
    inner: {
      minHeight: 54,
      paddingVertical: 8,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 18,
      letterSpacing: -0.02,
    },
    label: {
      fontSize: 10,
      lineHeight: 13,
      color: c.textMuted,
      marginTop: 3,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
}

export default CompactStatMetric;
