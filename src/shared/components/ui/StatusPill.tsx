import React, { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusPaint, type StatusTone } from '../../theme/statusColors';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { ON_BRAND, RADIUS } from '../../theme/designTokens';

export type StatusPillTone = StatusTone;

export type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  /** Viền / nền đậm hơn (tương đương `active` trên canvas). */
  emphasized?: boolean;
  /** Nhỏ hơn cho thẻ danh sách gọn. */
  compact?: boolean;
};

function toneColors(
  c: AppColorPalette,
  tone: StatusPillTone,
  emphasized: boolean,
): { fg: string; bg: string; border: string } {
  const p = statusPaint(c, tone);
  if (emphasized) {
    return { fg: ON_BRAND, bg: p.fg, border: p.fg };
  }
  return { fg: p.fg, bg: p.bg, border: p.border };
}

/**
 * Nhãn trạng thái dạng pill (thay cho `Pill` trong canvas SDK).
 */
export function StatusPill({
  children,
  tone = 'neutral',
  emphasized = false,
  compact = false,
}: StatusPillProps) {
  const c = useAppColors();
  const styles = useThemeStyleSheet(createStatusPillStyles);
  const { fg, bg, border } = toneColors(c, tone, emphasized);

  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      <Text
        style={[styles.text, compact && styles.textCompact, { color: fg }]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

function createStatusPillStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      maxWidth: '100%',
    },
    wrapCompact: {
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    text: {
      fontSize: 11,
      fontWeight: '700',
    },
    textCompact: {
      fontSize: 10,
      fontWeight: '600',
    },
  });
}

export default StatusPill;
