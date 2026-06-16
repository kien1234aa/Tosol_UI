import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SalesScreenHeader } from '../sales/components/SalesScreenHeader';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';

export type FinancePlaceholderScreenProps = {
  onOpenDrawer: () => void;
  title: string;
  hint?: string;
};

function createFinancePlaceholderStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    body: { padding: 20, gap: 10 },
    title: { fontSize: 20, fontWeight: '800', color: c.textPrimary },
    hint: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 20,
    },
  });
}

export function FinancePlaceholderScreen({
  onOpenDrawer,
  title,
  hint = 'Màn hình đang được phát triển.',
}: FinancePlaceholderScreenProps) {
  const styles = useThemeStyleSheet(createFinancePlaceholderStyles);
  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}
