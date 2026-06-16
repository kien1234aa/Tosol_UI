import { type TextStyle } from 'react-native';

const appFonts = {
  regular: 'BeVietnamPro-Regular',
  medium: 'BeVietnamPro-Medium',
  semibold: 'BeVietnamPro-SemiBold',
  bold: 'BeVietnamPro-Bold',
} as const;

export type AppFontWeight = keyof typeof appFonts;

export const fonts = appFonts;

/** Bundled Be Vietnam Pro face for the given weight. */
export function fontStyle(weight: AppFontWeight): TextStyle {
  return { fontFamily: appFonts[weight] };
}
