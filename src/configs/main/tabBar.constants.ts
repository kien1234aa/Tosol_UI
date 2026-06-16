import { animationConfig } from '@/src/configs/theme/animations';
import { lightTokens } from '@/src/configs/theme/colors';

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
  /** Light surface so the TOSOL logo (teal) stays readable. */
  bubbleBackground: lightTokens.background0,
  bubbleBorder: lightTokens.tertiary200,
  inactiveContent: lightTokens.typography500,
  activeBubbleIcon: lightTokens.tertiary600,
  activeLabel: lightTokens.typography900,
  borderTop: lightTokens.outline100,
} as const;

/** Full visual height including elevated FAB bubble. */
export const tabBarVisualHeight =
  tabBarLayout.barHeight + tabBarLayout.bubbleOverflow;

/** Flat tab-bar body height (library default). */
export const tabBarBodyHeight = tabBarLayout.barHeight;
