import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useCanvasScreenStyles } from './canvasScreenTheme';

export type CanvasScreenLayoutProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Root flex + nền `bg` chuẩn canvas cho mọi màn full-screen. */
export function CanvasScreenLayout({ children, style }: CanvasScreenLayoutProps) {
  const styles = useCanvasScreenStyles();
  return <View style={[styles.screenRoot, style]}>{children}</View>;
}
