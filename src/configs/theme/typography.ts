/** Font scale — slightly larger than default for mobile readability. */
export const fontSizes = {
  '2xs': 11,
  xs: 13,
  sm: 15,
  md: 17,
  lg: 19,
  xl: 21,
  '2xl': 25,
  '3xl': 30,
  caption: 13,
  body: 17,
  bodyLarge: 18,
  title: 20,
  heading: 24,
} as const;

export const lineHeights = {
  '2xs': 16,
  xs: 18,
  sm: 22,
  md: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeight = (typeof fontWeights)[keyof typeof fontWeights];
