import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { formSectionCard } from '../../theme/surfaceStyles';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import { CANVAS_SCREEN_PAD_H } from '../../theme/designTokens';

export type FormScreenHeadingProps = {
  /** Nhãn ngữ cảnh (ví dụ Danh mục / Cửa hàng). */
  sectionLabel: string;
  /** Tiêu đề màn (ví dụ Tạo khách hàng). */
  title: string;
  /** Mô tả ngắn tùy chọn dưới tiêu đề. */
  subtitle?: string;
};

/**
 * Khối tiêu đề thống nhất cho màn tạo/sửa form full-screen (đồng bộ với chrome danh sách).
 */
export function FormScreenHeading({
  sectionLabel,
  title,
  subtitle,
}: FormScreenHeadingProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createFormScreenHeadingStyles);
  const card = formSectionCard(c, mode);

  return (
    <View style={styles.outer}>
      <View style={[card, styles.wrap]}>
        <Text
          style={[styles.sectionLabel, { color: c.teal }]}
          numberOfLines={1}
        >
          {sectionLabel.toUpperCase()}
        </Text>
        <Text
          style={[styles.title, { color: c.textPrimary }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle != null && subtitle.length > 0 ? (
          <Text
            style={[styles.subtitle, { color: c.textMuted }]}
            numberOfLines={3}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function createFormScreenHeadingStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    outer: {
      paddingHorizontal: CANVAS_SCREEN_PAD_H,
      marginBottom: 12,
    },
    wrap: {
      marginBottom: 0,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.2,
      lineHeight: 28,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
    },
  });
}
