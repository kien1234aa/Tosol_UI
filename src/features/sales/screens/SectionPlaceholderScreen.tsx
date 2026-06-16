import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCanvasScreenStyles } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { SalesScreenHeader } from '../components/SalesScreenHeader';

export type SectionPlaceholderScreenProps = {
  onOpenDrawer: () => void;
  title: string;
  hint?: string;
};

/**
 * Màn gốc cho tính năng đã định danh mục nhưng chưa có API/UI đầy đủ.
 */
export function SectionPlaceholderScreen({
  onOpenDrawer,
  title,
  hint = 'Tính năng sẽ được bổ sung trong bản sau.',
}: SectionPlaceholderScreenProps) {
  const canvas = useCanvasScreenStyles();
  const insets = useSafeAreaInsets();

  return (
    <View style={canvas.screenRoot}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <View
        style={[canvas.screenPad, styles.body, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={canvas.placeholderCard}>
          <Text style={canvas.placeholderTitle}>{title}</Text>
          <Text style={canvas.placeholderHint}>{hint}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
});

