import React, { type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { elevatedCard } from '../../theme/surfaceStyles';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { RADIUS } from '../../theme/designTokens';

export type ChromeControlShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Khung ô tìm / chọn giống `chromeControlShell` trong canvas: bo 10px, viền secondary, nền tertiary.
 */
export function ChromeControlShell({
  children,
  style,
}: ChromeControlShellProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createChromeControlShellStyles);
  return (
    <View style={[styles.root, elevatedCard(c, mode), style]}>{children}</View>
  );
}

function createChromeControlShellStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      borderRadius: RADIUS.control,
      borderWidth: 1,
      borderColor: c.borderMid,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
    },
  });
}

export default ChromeControlShell;
