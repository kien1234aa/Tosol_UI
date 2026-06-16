import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import type { AppColorPalette } from '../../theme/colorPalettes';

export type SectionTitleProps = {
  label: string;
};

/** Tiêu đề section kiểu sellerUiDemo — chữ đậm, không vạch trái. */
export function SectionTitle({ label }: SectionTitleProps) {
  const styles = useThemeStyleSheet(createSectionTitleStyles);
  const c = useAppColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: c.textPrimary }]}>{label}</Text>
    </View>
  );
}

function createSectionTitleStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    row: {
      marginBottom: 4,
    },
    text: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
  });
}

export default SectionTitle;
