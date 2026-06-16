import React from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { detailScreenScrollFlex } from './detailScreenLayout';

/**
 * Vertical `ScrollView` for detail tab panels: bounded flex height + Android nested scroll handoff
 * with horizontal tab strips above.
 */
export function DetailScreenTabScroll({
  style,
  nestedScrollEnabled = true,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  ...rest
}: ScrollViewProps) {
  return (
    <ScrollView
      style={[detailScreenScrollFlex, style]}
      nestedScrollEnabled={nestedScrollEnabled}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    />
  );
}
