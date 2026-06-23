import { tabBarLayout } from '@/src/configs/main';

const { waveNotchWidth: NOTCH_WIDTH, bubbleSize: BUBBLE_SIZE } = tabBarLayout;

/** Center X of bubble / notch for the active tab slot. */
export function getBubbleCenterX(
  barWidth: number,
  tabCount: number,
  activeIndex: number,
): number {
  if (barWidth <= 0 || tabCount <= 0) {
    return barWidth / 2;
  }

  const tabSlotWidth = barWidth / tabCount;
  return tabSlotWidth * activeIndex + tabSlotWidth / 2;
}

/** Bubble container `left` — bubble center minus bubble radius. */
export function getBubbleTranslateX(
  barWidth: number,
  tabCount: number,
  activeIndex: number,
): number {
  return getBubbleCenterX(barWidth, tabCount, activeIndex) - BUBBLE_SIZE / 2;
}

/**
 * Horizontal offset for the sliding wave SVG so the semicircular notch
 * aligns with `bubbleCenterX` (same math as rn-wave-bottom-bar).
 */
export function getWaveSvgTranslateX(
  bubbleCenterX: number,
  barWidth: number,
  notchWidth = NOTCH_WIDTH,
): number {
  return bubbleCenterX - barWidth - notchWidth / 2;
}

/** @deprecated Use getBubbleCenterX — kept for compatibility. */
export function getWaveNotchTranslateX(
  barWidth: number,
  tabCount: number,
  activeIndex: number,
): number {
  return getBubbleTranslateX(barWidth, tabCount, activeIndex);
}
