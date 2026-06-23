/** Shared tuning for @shopify/flash-list (v2). */
export const flashListPerformance = {
  /** Pixels rendered above/below the viewport while scrolling. */
  drawDistance: 280,
} as const;

/** Order cards are tall — prefetch a bit more while scrolling. */
export const orderListFlashListProps = {
  drawDistance: 360,
} as const;

/** Product grid cells — moderate prefetch. */
export const productGridFlashListProps = {
  drawDistance: 240,
} as const;
