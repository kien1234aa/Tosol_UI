import React, { memo, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { lightColors } from '@/src/core/theme';

interface KeyboardAwareScreenProps {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
  edges?: readonly Edge[];
}

const DEFAULT_EDGES: readonly Edge[] = ['top', 'bottom', 'left', 'right'];

/**
 * Shared screen shell: applies safe-area insets, avoids the keyboard, and
 * centers scrollable content. Reused by any form-style screen.
 */
function KeyboardAwareScreenComponent({
  children,
  contentContainerStyle,
  backgroundColor = lightColors.background0,
  edges = DEFAULT_EDGES,
}: KeyboardAwareScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export const KeyboardAwareScreen = memo(KeyboardAwareScreenComponent);
