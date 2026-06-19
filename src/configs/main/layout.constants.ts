import { tabBarLayout, tabBarVisualHeight } from './tabBar.constants';

export const mainLayout = {
  tabBarHeight: tabBarLayout.barHeight,
  tabBarVisualHeight,
  /** Scroll content padding above the tab bar (standard). */
  tabContentBottomPadding: tabBarVisualHeight + 24,
  /** Fixed footer bar inside a tab stack, sitting above the tab bar. */
  tabStackFooterPaddingBottom: tabBarVisualHeight + 16,
  footerActionHeight: 48,
  primaryButtonHeight: 52,
} as const;
