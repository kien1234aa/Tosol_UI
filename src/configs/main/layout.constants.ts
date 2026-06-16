import { tabBarLayout, tabBarVisualHeight } from './tabBar.constants';

export const mainLayout = {
  tabBarHeight: tabBarLayout.barHeight,
  tabBarVisualHeight,
  fabBottomOffset: tabBarVisualHeight + 8,
  /** Scroll content padding above the tab bar (standard). */
  tabContentBottomPadding: tabBarVisualHeight + 24,
  /** Extra room when a SupportFab sits above the tab bar. */
  tabContentBottomPaddingLoose: tabBarVisualHeight + 32,
  /** Fixed footer bar inside a tab stack, sitting above the tab bar. */
  tabStackFooterPaddingBottom: tabBarVisualHeight + 16,
  footerActionHeight: 48,
  primaryButtonHeight: 52,
} as const;
