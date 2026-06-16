import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';

export type DetailQuickDockProps = ViewProps & {
  children: React.ReactNode;
  bottomInset: number;
};

/** Chiều cao tối đa nội dung dock (~24–26% màn hình, có trần) để vùng tab phía trên còn đủ lướt. */
function maxDockBodyHeight(screenH: number): number {
  return Math.round(Math.min(200, Math.max(120, screenH * 0.25)));
}

export function DetailQuickDock({
  bottomInset,
  children,
  style,
  ...rest
}: DetailQuickDockProps) {
  const styles = useThemeStyleSheet(create_styles);
  const { height } = useWindowDimensions();
  const bodyMaxH = useMemo(() => maxDockBodyHeight(height), [height]);

  return (
    <View
      style={[styles.outer, { paddingBottom: Math.max(bottomInset, 8) }, style]}
      {...rest}
    >
      <ScrollView
        style={[styles.bodyScroll, { maxHeight: bodyMaxH }]}
        contentContainerStyle={styles.bodyScrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    outer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.bg,
      paddingTop: 6,
      paddingHorizontal: 12,
    },
    bodyScroll: {
      flexGrow: 0,
    },
    bodyScrollContent: {
      paddingBottom: 2,
    },
  });
}
