/**
 * Runtime color values mirroring Gluestack tokens in
 * `src/uikits/gluestack-ui-provider/config.ts` (light mode).
 * Use Tailwind classes (bg-background-50, text-typography-900, …) in JSX;
 * use these only where StyleSheet / native props require a string.
 */
const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

/** Light palette — richer teal brand, stronger contrast, still bright surfaces */
export const lightTokens = {
  background0: rgb(255, 255, 255),
  background50: rgb(236, 240, 242),
  background100: rgb(226, 232, 235),
  backgroundMuted: rgb(232, 238, 240),
  secondary100: rgb(240, 243, 244),
  secondary200: rgb(232, 236, 238),
  outline100: rgb(200, 208, 212),
  outline200: rgb(180, 190, 196),
  typography0: rgb(254, 254, 255),
  typography500: rgb(105, 112, 118),
  typography900: rgb(22, 30, 36),
  /** Richer brand teal — deeper than logo sample for UI contrast */
  tertiary50: rgb(220, 238, 243),
  tertiary100: rgb(186, 222, 230),
  tertiary200: rgb(148, 198, 210),
  tertiary500: rgb(46, 113, 133),
  tertiary600: rgb(34, 95, 112),
  error500: rgb(230, 53, 53),
} as const;

/** Dark tokens for splash and future dark surfaces */
export const darkTokens = {
  background0: rgb(18, 18, 18),
  backgroundMuted: rgb(51, 51, 51),
  outline200: rgb(83, 82, 82),
} as const;

/** @deprecated Prefer Tailwind token classes; kept for StyleSheet / native APIs */
export const lightColors = {
  /** Screen canvas — background-50 */
  background0: lightTokens.background50,
  background100: lightTokens.background100,
  /** Input fill — secondary-200 */
  inputBackground: lightTokens.secondary200,
  /** CTA — logo brand teal tertiary-500/600 */
  brandPrimary: lightTokens.tertiary500,
  brandPrimaryPressed: lightTokens.tertiary600,
  /** @deprecated Use brandPrimary */
  brandOrange: lightTokens.tertiary500,
  brandOrangePressed: lightTokens.tertiary600,
  typography900: lightTokens.typography900,
  typography500: lightTokens.typography500,
  typography0: lightTokens.typography0,
  outline200: lightTokens.outline200,
  error500: lightTokens.error500,
} as const;

export const darkColors = {
  background0: darkTokens.background0,
  backgroundMuted: darkTokens.backgroundMuted,
  outline200: darkTokens.outline200,
  splashCanvas: darkTokens.background0,
} as const;

export type LightColors = typeof lightColors;
export type DarkColors = typeof darkColors;
