import { Platform, type TextStyle, type ViewStyle } from 'react-native';

const FOOTER_ACTION_HEIGHT = 48;
const PRIMARY_BUTTON_HEIGHT = 56;

/** Centers label/icon inside Pressable-based buttons on native. */
export const buttonContentCenter: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
};

export const buttonFooterAction: ViewStyle = {
  ...buttonContentCenter,
  height: FOOTER_ACTION_HEIGHT,
  borderRadius: 12,
};

export const buttonPrimaryCta: ViewStyle = {
  ...buttonContentCenter,
  height: PRIMARY_BUTTON_HEIGHT,
  borderRadius: 12,
};

export const buttonFlex: ViewStyle = {
  flex: 1,
};

/** Reduces extra vertical padding around text on Android. */
export const buttonLabelStyle: TextStyle = Platform.select({
  android: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  default: {
    textAlign: 'center',
  },
}) ?? { textAlign: 'center' };
