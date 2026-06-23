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
const bubbleSize = 52;
const bubbleNotchMargin = 10;

export const tabBarLayout = {
  barHeight: 56,
  bubbleSize,
  /** Khoảng hở mỗi bên giữa bong bóng và mép vết lõm. */
  bubbleNotchMargin,
  /** Rộng vết lõm = bubble + margin hai bên. Bán kính = width / 2. */
  waveNotchWidth: bubbleSize + bubbleNotchMargin * 2,
  /** Bubble center sits on bar top — half above, half in the notch. */
  bubbleFloatOffset: bubbleSize / 2,
  bubbleOverflow: 26,
  iconSize: 24,
  focusedIconSize: 26,
  homeLogoSize: 32,
  labelFontSize: 12,
  spring: {
    damping: 18,
    mass: 0.22,
    stiffness: 480,
  } as const,
  bubblePopSpring: {
    damping: 12,
    mass: 0.28,
    stiffness: 560,
  } as const,
  pressSpring: animationConfig.pressSpring,
} as const;

export const tabBarColors = {
  /** Wave bar + notch — một bậc đậm hơn tertiary-50 để tab nổi rõ hơn. */
  waveBackground: lightTokens.tertiary100,
  inactiveContent: lightTokens.typography500,
  activeBubbleIcon: lightTokens.tertiary600,
  activeLabel: lightTokens.typography900,
  fabBackground: lightTokens.tertiary600,
  /** Bright white floating bubble — semi-transparent glass. */
  bubbleBackground: 'rgba(255, 255, 255, 0.55)',
  bubbleBorder: 'rgba(255, 255, 255, 0.45)',
  glassHighlight: 'rgba(255, 255, 255, 0.35)',
  glassShadow: 'rgba(34, 95, 112, 0.18)',
  borderTop: lightTokens.outline100,
} as const;

export const tabBarColorsDark = {
  waveBackground: lightTokens.tertiary200,
  inactiveContent: lightTokens.typography500,
  activeBubbleIcon: lightTokens.tertiary100,
  activeLabel: lightTokens.typography0,
  fabBackground: lightTokens.tertiary500,
  bubbleBackground: 'rgba(255, 255, 255, 0.42)',
  bubbleBorder: 'rgba(255, 255, 255, 0.28)',
  glassHighlight: 'rgba(255, 255, 255, 0.18)',
  glassShadow: 'rgba(0, 0, 0, 0.35)',
  borderTop: lightTokens.tertiary200,
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
