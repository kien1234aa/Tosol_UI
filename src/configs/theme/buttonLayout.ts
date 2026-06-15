import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { mainLayout } from '@/src/configs/main/layout.constants';

/** Centers label/icon inside Pressable-based buttons on native. */
export const buttonContentCenter: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
};

export const buttonFooterAction: ViewStyle = {
  ...buttonContentCenter,
  height: mainLayout.footerActionHeight,
  borderRadius: 12,
};

export const buttonPrimaryCta: ViewStyle = {
  ...buttonContentCenter,
  height: mainLayout.primaryButtonHeight,
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
