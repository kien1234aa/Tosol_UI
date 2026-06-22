import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  STACK_HEADER_BACK_SIZE,
} from '@/src/components/main/StackHeader';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';

interface FormKeyboardAvoidingViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra offset beyond the stack header (e.g. tabs row). */
  extraOffset?: number;
}

export function FormKeyboardAvoidingView({
  children,
  style,
  extraOffset = 0,
}: FormKeyboardAvoidingViewProps) {
  const { scale } = useResponsiveLayout();
  const headerOffset =
    scale(14) * 2 + scale(STACK_HEADER_BACK_SIZE) + 1 + extraOffset;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerOffset : 0}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
