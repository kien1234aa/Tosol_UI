import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import { Button } from './Button';

export type CanvasPaginationRowProps = {
  currentPage: number;
  lastPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

/** Hàng «Trang trước | Trang x/y | Trang sau» giống canvas. */
export function CanvasPaginationRow({
  currentPage,
  lastPage,
  loading,
  onPageChange,
}: CanvasPaginationRowProps) {
  const c = useAppColors();
  const styles = useThemeStyleSheet(createCanvasPaginationRowStyles);
  const page = Math.max(1, currentPage);
  const last = Math.max(1, lastPage);

  return (
    <View style={styles.row}>
      <Button
        title="Trang trước"
        variant="secondary"
        size="sm"
        disabled={Boolean(loading) || page <= 1}
        onPress={() => onPageChange(page - 1)}
      />
      <Text style={[styles.mid, { color: c.textSecondary }]}>
        Trang {page} / {last}
      </Text>
      <Button
        title="Trang sau"
        variant="secondary"
        size="sm"
        disabled={Boolean(loading) || page >= last}
        onPress={() => onPageChange(page + 1)}
      />
    </View>
  );
}

function createCanvasPaginationRowStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 16,
      paddingTop: 8,
    },
    mid: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
