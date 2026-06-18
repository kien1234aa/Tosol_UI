import { animationConfig } from '@/src/configs/theme/animations';
import { darkTokens, lightTokens } from '@/src/configs/theme/colors';

/** Bảng màu cho wave bottom tab navigator. */
export type WaveBottomTabColors = {
  activeBackground: string;
  activeTint: string;
  inactiveTint: string;
  inactiveLabel?: string;
};

/** Layout + theme tokens for `rn-wave-bottom-bar`. */
export const tabBarLayout = {
  barHeight: 52,
  bubbleSize: 52,
  bubbleFloatOffset: 18,
  bubbleOverflow: 20,
  iconSize: 22,
  focusedIconSize: 24,
  homeLogoSize: 30,
  spring: {
    damping: 23,
    mass: 0.3,
    stiffness: 300,
  } as const,
  pressSpring: animationConfig.pressSpring,
} as const;

export const tabBarColors = {
  waveBackground: lightTokens.background0,
  inactiveContent: lightTokens.typography500,
  activeBubbleIcon: lightTokens.tertiary600,
  activeLabel: lightTokens.typography900,
  fabBackground: lightTokens.tertiary600,
  bubbleBackground: lightTokens.background0,
  bubbleBorder: lightTokens.tertiary200,
  borderTop: lightTokens.outline100,
} as const;

export const tabBarColorsDark = {
  waveBackground: darkTokens.background0,
  inactiveContent: lightTokens.typography500,
  activeBubbleIcon: lightTokens.tertiary100,
  activeLabel: lightTokens.typography0,
  fabBackground: lightTokens.tertiary500,
  bubbleBackground: darkTokens.backgroundMuted,
  bubbleBorder: darkTokens.outline200,
  borderTop: darkTokens.outline200,
} as const;

export type TabBarColors = typeof tabBarColors;

/** Wave navigator palette for the active color scheme. */
export function waveBottomTabColorsForScheme(
  scheme: 'light' | 'dark' | null | undefined,
): WaveBottomTabColors {
  const palette = scheme === 'dark' ? tabBarColorsDark : tabBarColors;
  return {
    activeBackground: palette.waveBackground,
    activeTint: palette.fabBackground,
    inactiveTint: palette.inactiveContent,
    inactiveLabel: palette.inactiveContent,
  };
}

/** Full visual height including elevated FAB bubble. */
export const tabBarVisualHeight =
  tabBarLayout.barHeight + tabBarLayout.bubbleOverflow;

/** Flat tab-bar body height. */
export const tabBarBodyHeight = tabBarLayout.barHeight;
