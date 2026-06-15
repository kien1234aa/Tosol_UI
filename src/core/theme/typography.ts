/** Font sizes and weights aligned with the login design hierarchy. */
export const fontSizes = {
  caption: 13,
  body: 15,
  bodyLarge: 16,
  title: 18,
  heading: 22,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeight = (typeof fontWeights)[keyof typeof fontWeights];
