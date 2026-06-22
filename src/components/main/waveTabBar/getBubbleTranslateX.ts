import { tabBarLayout } from '@/src/configs/main';

/** Horizontal bubble position — same centering math as the library wave notch. */
export function getBubbleTranslateX(
  barWidth: number,
  tabCount: number,
  activeIndex: number,
): number {
  if (barWidth <= 0 || tabCount <= 0) {
    return 0;
  }

  const tabSlotWidth = barWidth / tabCount;
  const notchWidth = tabBarLayout.waveNotchWidth;
  return tabSlotWidth * activeIndex + (tabSlotWidth - notchWidth) / 2;
}
