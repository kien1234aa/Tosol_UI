import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useCanvasScreenStyles } from './canvasScreenTheme';

/** Hàng thống kê (CompactStatMetric) trong thẻ canvas — màn danh sách / dashboard. */
export function CanvasListStatsBand({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useCanvasScreenStyles();
  return (
    <View style={[styles.listStatsBand, style]}>
      <View style={styles.listStatsBandInner}>{children}</View>
    </View>
  );
}

/** Khối ô tìm + lọc bo thẻ (giống mockup dashboard). */
export function CanvasListToolbarShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useCanvasScreenStyles();
  return (
    <View style={[styles.listToolbarShell, style]}>
      <View style={styles.listToolbarInner}>{children}</View>
    </View>
  );
}

/** Vùng danh sách: tiêu đề section + các thẻ list bên dưới. */
export function CanvasListSection({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useCanvasScreenStyles();
  return <View style={[styles.listSection, style]}>{children}</View>;
}
