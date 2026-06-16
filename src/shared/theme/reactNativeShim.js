/**
 * Thay thế `react-native` cho code app — Text/TextInput luôn dùng Inter.
 * Metro chỉ redirect import từ `src/`, không đụng code trong `node_modules`.
 */
const React = require('react');

/** Metro resolve: từ file này → `node_modules/react-native/index.js` (không qua shim). */
const RN = require('react-native');

const { Platform, StyleSheet } = RN;

const FONT = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
};

const FONT_WEIGHT_TO_FAMILY = {
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

const SKIP_FONT_FAMILY =
  /^(Ionicons|MaterialIcons|MaterialCommunityIcons|FontAwesome|FontAwesome5|FontAwesome6|Entypo|Feather|AntDesign|monospace)/i;

function resolveInterFontFamily(style) {
  const flat = StyleSheet.flatten(style) ?? {};
  const existing = flat.fontFamily;
  if (existing != null && SKIP_FONT_FAMILY.test(String(existing))) {
    return undefined;
  }
  const key = String(flat.fontWeight ?? '400').toLowerCase();
  return FONT_WEIGHT_TO_FAMILY[key] ?? FONT.regular;
}

/** Android: chỉ `fontFamily` — nếu giữ `fontWeight` hệ thống sẽ dùng Roboto. */
function interStylePatch(style) {
  const fontFamily = resolveInterFontFamily(style);
  if (fontFamily == null) {
    return undefined;
  }
  if (Platform.OS === 'android') {
    return { fontFamily, fontWeight: 'normal' };
  }
  return { fontFamily };
}

function mergeInterStyle(style) {
  const patch = interStylePatch(style);
  if (patch == null) {
    return style;
  }
  return StyleSheet.compose(style, patch);
}

function wrapTextComponent(Original, displayName) {
  const Wrapped = React.forwardRef(function TosolInterText(props, ref) {
    return React.createElement(Original, {
      ...props,
      ref,
      style: mergeInterStyle(props.style),
    });
  });
  Wrapped.displayName = displayName;
  return Wrapped;
}

const NativeText = RN.Text;
const NativeTextInput = RN.TextInput;

const exportsShim = RN;

Object.defineProperty(exportsShim, 'Text', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: wrapTextComponent(NativeText, 'Text'),
});

Object.defineProperty(exportsShim, 'TextInput', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: wrapTextComponent(NativeTextInput, 'TextInput'),
});

module.exports = exportsShim;
