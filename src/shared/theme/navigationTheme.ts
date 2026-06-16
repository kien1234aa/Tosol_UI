import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { AppColorPalette, ThemeMode } from './colorPalettes';

/** Theme stack Bán hàng theo chế độ sáng/tối. */
export function buildSalesNavigationTheme(
  mode: ThemeMode,
  c: AppColorPalette,
): Theme {
  if (mode === 'light') {
    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: c.teal,
        background: c.bg,
        card: c.bg,
        text: c.textPrimary,
        border: c.border,
        notification: c.teal,
      },
    };
  }
  return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: c.teal,
      background: c.bg,
      card: c.bg,
      text: c.textPrimary,
      border: c.border,
      notification: c.tealLight,
    },
  };
}
