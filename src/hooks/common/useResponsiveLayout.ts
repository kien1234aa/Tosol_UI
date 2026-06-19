import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  getScaleFactor,
  isCompactPhone,
  isLandscapeLayout,
  isTabletLayout,
  resolveContentMaxWidth,
  resolveGridGap,
  resolveHomeActionColumns,
  resolveHorizontalPadding,
  resolveProductGridColumns,
  resolveQuickActionColumns,
  scaleSize,
} from '@/src/helpers/layout';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  isCompact: boolean;
  /** Proportional scale factor (0.88–1.14). */
  scaleFactor: number;
  /** Scale a fixed design value to the current screen. */
  scale: (size: number) => number;
  horizontalPadding: number;
  gridGap: number;
  productGridColumns: number;
  quickActionColumns: number;
  /** Max content widths for different layout modes. */
  contentMaxWidth: {
    form: number;
    screen: number;
    wide: number;
  };
  /** Columns for home action icon grids. */
  homeActionColumns: (itemCount: number) => number;
}

/**
 * Derives responsive layout values from the current window size.
 * Memoized so consumers only re-render when the derived shape changes.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  const isTablet = isTabletLayout({ width, height });
  const isLandscape = isLandscapeLayout({ width, height });
  const isCompact = isCompactPhone(width);
  const scaleFactor = getScaleFactor(width);

  const horizontalPadding = useMemo(
    () => resolveHorizontalPadding(width, isTablet),
    [width, isTablet],
  );

  const gridGap = useMemo(
    () => resolveGridGap(width, isTablet),
    [width, isTablet],
  );

  const productGridColumns = useMemo(
    () => resolveProductGridColumns(width, isTablet),
    [width, isTablet],
  );

  const quickActionColumns = useMemo(
    () => resolveQuickActionColumns(width, isTablet),
    [width, isTablet],
  );

  const contentMaxWidth = useMemo(
    () => ({
      form: resolveContentMaxWidth(width, isTablet, 'form'),
      screen: resolveContentMaxWidth(width, isTablet, 'screen'),
      wide: resolveContentMaxWidth(width, isTablet, 'wide'),
    }),
    [width, isTablet],
  );

  const scale = useCallback(
    (size: number) => scaleSize(size, width),
    [width],
  );

  const homeActionColumns = useCallback(
    (itemCount: number) => resolveHomeActionColumns(width, isTablet, itemCount),
    [width, isTablet],
  );

  return useMemo(
    () => ({
      width,
      height,
      isTablet,
      isLandscape,
      isCompact,
      scaleFactor,
      scale,
      horizontalPadding,
      gridGap,
      productGridColumns,
      quickActionColumns,
      contentMaxWidth,
      homeActionColumns,
    }),
    [
      width,
      height,
      isTablet,
      isLandscape,
      isCompact,
      scaleFactor,
      scale,
      horizontalPadding,
      gridGap,
      productGridColumns,
      quickActionColumns,
      contentMaxWidth,
      homeActionColumns,
    ],
  );
}
