import { Platform, StyleSheet, type TextStyle } from 'react-native';

/** PostScript / file names sau khi link bằng react-native-asset. */
export const FONT = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
} as const;

const FONT_WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': FONT.regular,
  '200': FONT.regular,
  '300': FONT.regular,
  '400': FONT.regular,
  normal: FONT.regular,
  '500': FONT.medium,
  medium: FONT.medium,
  '600': FONT.semiBold,
  semibold: FONT.semiBold,
  '700': FONT.bold,
  bold: FONT.bold,
  '800': FONT.extraBold,
  '900': FONT.extraBold,
};

/** Font icon / monospace — không ghi đè bằng Inter. */
const SKIP_FONT_FAMILY =
  /^(Ionicons|MaterialIcons|MaterialCommunityIcons|FontAwesome|FontAwesome5|FontAwesome6|Entypo|Feather|AntDesign|monospace)/i;

export function resolveInterFontFamily(
  style: TextStyle | TextStyle[] | undefined | null,
): string | undefined {
  const flat = StyleSheet.flatten(style) ?? {};

  const existing = flat.fontFamily;
  if (existing != null && SKIP_FONT_FAMILY.test(String(existing))) {
    return undefined;
  }

  const key = String(flat.fontWeight ?? '400').toLowerCase();
  return FONT_WEIGHT_TO_FAMILY[key] ?? FONT.regular;
}

/** Style áp Inter theo `fontWeight`; Android cần `fontFamily` tường minh. */
export function interTextStyle(
  style?: TextStyle | TextStyle[] | null,
): TextStyle | undefined {
  const fontFamily = resolveInterFontFamily(style);
  if (fontFamily == null) {
    return undefined;
  }

  if (Platform.OS === 'android') {
    return { fontFamily, fontWeight: 'normal' };
  }

  return { fontFamily };
}
