import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { AppColorPalette } from './colorPalettes';
import { useAppColors } from './ThemeContext';

/**
 * StyleSheet theo palette hiện tại — `factory` nên khai báo ở scope module (ổn định tham chiếu).
 */
export function useThemeStyleSheet<T extends StyleSheet.NamedStyles<T>>(
  factory: (c: AppColorPalette) => T,
): T {
  const c = useAppColors();
  return useMemo(() => StyleSheet.create(factory(c)) as T, [c, factory]);
}
