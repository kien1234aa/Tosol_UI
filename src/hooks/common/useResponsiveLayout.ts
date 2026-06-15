import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  isTablet: boolean;
  isLandscape: boolean;
  /** Max content width so forms stay readable on tablets/landscape. */
  contentMaxWidth: number;
  horizontalPadding: number;
}

const TABLET_BREAKPOINT = 768;

/**
 * Derives responsive layout values from the current window size.
 * Memoized so consumers only re-render when the derived shape changes.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = Math.min(width, height) >= TABLET_BREAKPOINT;
    const isLandscape = width > height;

    return {
      isTablet,
      isLandscape,
      contentMaxWidth: isTablet ? 440 : 480,
      horizontalPadding: isTablet ? 48 : 24,
    };
  }, [width, height]);
}
