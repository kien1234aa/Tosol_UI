/**
 * Centralized color tokens derived from the Gluestack UI provider config.
 * Keeping a single source of truth lets us reuse exact values inside
 * StyleSheet / Reanimated styles where Tailwind classNames are unavailable.
 */
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  brandOrange: '#F0A020',
  brandOrangePressed: '#D88B12',

  inputBackground: '#E8EDF2',
  surfaceMuted: '#F2F1F1',

  typographyStrong: '#262627',
  typographyMuted: '#8C8C8C',
  outline: '#D9DEE3',

  error: '#E63535',
} as const;

export const lightColors = {
  background0: palette.white,
  background100: palette.surfaceMuted,
  inputBackground: palette.inputBackground,
  brandOrange: palette.brandOrange,
  brandOrangePressed: palette.brandOrangePressed,
  typography900: palette.typographyStrong,
  typography500: palette.typographyMuted,
  outline200: palette.outline,
  error500: palette.error,
} as const;

export const darkColors = {
  background0: 'rgb(18, 18, 18)',
  backgroundMuted: 'rgb(51, 51, 51)',
  outline200: 'rgb(83, 82, 82)',
  /** Match PNG assets that use pure black backgrounds */
  splashCanvas: palette.black,
} as const;

export type LightColors = typeof lightColors;
export type DarkColors = typeof darkColors;
