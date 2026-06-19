/** Reference width (iPhone 14) for proportional scaling. */
export const RESPONSIVE_BASE_WIDTH = 390;

/** Shortest edge at or above this value is treated as a tablet. */
export const TABLET_BREAKPOINT = 768;

/** Large tablet / desktop-class layouts. */
export const LARGE_TABLET_BREAKPOINT = 1024;

/** Clamp scale so typography and touch targets stay readable. */
export const RESPONSIVE_SCALE_MIN = 0.88;
export const RESPONSIVE_SCALE_MAX = 1.14;

/** Horizontal screen padding by width tier (phone / tablet / large tablet). */
export const SCREEN_PADDING = {
  compact: 16,
  phone: 20,
  tablet: 32,
  largeTablet: 48,
} as const;

/** Shared gap between grid cells. */
export const GRID_GAP = {
  compact: 10,
  phone: 12,
  tablet: 16,
} as const;

/** Max readable content width on wide screens. */
export const CONTENT_MAX_WIDTH = {
  form: 440,
  screen: 720,
  wide: 960,
} as const;
