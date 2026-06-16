import {
  darkPalette,
  lightPalette,
  type AppColorPalette,
  type ThemeMode,
} from './colorPalettes';

export type SplashTheme = {
  background: string;
  spinner: string;
  statusBarStyle: 'light-content' | 'dark-content';
};

/** Màu splash — light: nền trắng, dark: nền tối khớp palette app. */
export function resolveSplashTheme(
  mode: ThemeMode,
  colors?: AppColorPalette,
): SplashTheme {
  const palette = colors ?? (mode === 'light' ? lightPalette : darkPalette);
  return {
    background: mode === 'light' ? palette.surfaceWhite : palette.bg,
    spinner: mode === 'light' ? palette.textSecondary : palette.textPrimary,
    statusBarStyle: mode === 'light' ? 'dark-content' : 'light-content',
  };
}
