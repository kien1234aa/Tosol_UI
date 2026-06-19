import {
  CONTENT_MAX_WIDTH,
  GRID_GAP,
  LARGE_TABLET_BREAKPOINT,
  RESPONSIVE_BASE_WIDTH,
  RESPONSIVE_SCALE_MAX,
  RESPONSIVE_SCALE_MIN,
  SCREEN_PADDING,
  TABLET_BREAKPOINT,
} from '@/src/configs/theme/responsive.constants';

export interface LayoutDimensions {
  width: number;
  height: number;
}

/** Proportional scale factor clamped for readability across devices. */
export function getScaleFactor(width: number): number {
  const raw = width / RESPONSIVE_BASE_WIDTH;
  return Math.min(RESPONSIVE_SCALE_MAX, Math.max(RESPONSIVE_SCALE_MIN, raw));
}

/** Scale a fixed design value to the current screen width. */
export function scaleSize(size: number, width: number): number {
  return Math.round(size * getScaleFactor(width));
}

export function isTabletLayout({ width, height }: LayoutDimensions): boolean {
  return Math.min(width, height) >= TABLET_BREAKPOINT;
}

export function isLandscapeLayout({ width, height }: LayoutDimensions): boolean {
  return width > height;
}

export function isCompactPhone(width: number): boolean {
  return width < 360;
}

/** Horizontal padding that grows on tablets and very narrow phones. */
export function resolveHorizontalPadding(
  width: number,
  isTablet: boolean,
): number {
  if (isTablet) {
    return width >= LARGE_TABLET_BREAKPOINT
      ? SCREEN_PADDING.largeTablet
      : SCREEN_PADDING.tablet;
  }

  if (width < 340) {
    return SCREEN_PADDING.compact;
  }

  return SCREEN_PADDING.phone;
}

/** Grid gap tuned for density on small vs large screens. */
export function resolveGridGap(width: number, isTablet: boolean): number {
  if (isTablet) {
    return GRID_GAP.tablet;
  }

  return width < 360 ? GRID_GAP.compact : GRID_GAP.phone;
}

/** Max content width so lists and forms stay readable on tablets. */
export function resolveContentMaxWidth(
  width: number,
  isTablet: boolean,
  variant: keyof typeof CONTENT_MAX_WIDTH = 'screen',
): number {
  if (!isTablet) {
    return width;
  }

  const horizontalPadding = resolveHorizontalPadding(width, true);
  return Math.min(
    width - horizontalPadding * 2,
    CONTENT_MAX_WIDTH[variant],
  );
}

/** Product grid columns: 2 on phones, up to 4 on large tablets. */
export function resolveProductGridColumns(
  width: number,
  isTablet: boolean,
): number {
  if (isTablet) {
    if (width >= LARGE_TABLET_BREAKPOINT) {
      return 4;
    }
    return 3;
  }

  if (width >= 520) {
    return 3;
  }

  return 2;
}

/**
 * Home action icon columns — avoids cramped 4-up layout on narrow phones.
 */
export function resolveHomeActionColumns(
  width: number,
  isTablet: boolean,
  itemCount: number,
): number {
  if (isTablet) {
    return Math.min(itemCount, 5);
  }

  if (width < 360) {
    return Math.min(itemCount, 2);
  }

  if (width < 400) {
    return Math.min(itemCount, 3);
  }

  return Math.min(itemCount, 4);
}

/** Quick-action cards: 2 columns on phone, 3 on tablet when space allows. */
export function resolveQuickActionColumns(
  width: number,
  isTablet: boolean,
): number {
  if (isTablet && width >= TABLET_BREAKPOINT) {
    return 3;
  }

  return 2;
}
