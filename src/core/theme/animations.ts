/** Shared animation timings so motion feels consistent across the app. */
export const animationConfig = {
  /** Splash auto-advance delay in ms. */
  splashDuration: 2500,
  /** Generic screen entry duration in ms. */
  screenEntry: 450,
  /** Stagger between sequential elements in ms. */
  stagger: 90,
  /** Button press spring config. */
  pressSpring: {
    damping: 15,
    stiffness: 220,
    mass: 0.6,
  },
  /** Scale applied while a button is pressed. */
  pressScale: 0.97,
} as const;
