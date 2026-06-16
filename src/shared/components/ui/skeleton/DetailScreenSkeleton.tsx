import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import { RADIUS } from '../../../theme/designTokens';
import { elevatedCard } from '../../../theme/surfaceStyles';
import { useAppColors, useThemeMode } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import { SkeletonBone } from './SkeletonBone';

export type DetailScreenSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

/** Thay spinner giữa màn khi tải chi tiết (order, PO, khách hàng, …). */
export function DetailScreenSkeleton({ style }: DetailScreenSkeletonProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createDetailScreenSkeletonStyles);
  const panel = elevatedCard(c, mode);
  /** Một overlay/detail tại một thời điểm — không cần gate focus như list multi-tab. */
  const animate = true;

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.hero, panel]}>
        {/* height=26 khớp heroTitle lineHeight=26 */}
        <SkeletonBone width="55%" height={26} borderRadius={6} animate={animate} />
        <View style={styles.heroPills}>
          {/* height=23 khớp StatusPill: paddingVertical:4×2 + fontSize:11 lineHeight≈15 */}
          <SkeletonBone width={88} height={23} borderRadius={RADIUS.pill} animate={animate} />
          <SkeletonBone width={72} height={23} borderRadius={RADIUS.pill} animate={animate} />
        </View>
        {/* height=18 khớp heroSubtitle fontSize=13 */}
        <SkeletonBone width="90%" height={18} animate={animate} />
        <SkeletonBone width="70%" height={18} animate={animate} />
      </View>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.panel, panel]}>
          {/* panelTitle: fontSize=12 fontWeight='800' uppercase — marginBottom=12 khớp panelTitleRow */}
          <SkeletonBone width={140} height={17} borderRadius={6} style={styles.panelTitle} animate={animate} />
          {/* 3 dòng khớp CanvasDetailRow: paddingVertical:10 + text fontSize=13 */}
          <View style={styles.detailRow}>
            <SkeletonBone width="38%" height={17} animate={animate} />
            <SkeletonBone width="28%" height={17} animate={animate} />
          </View>
          <View style={styles.detailRow}>
            <SkeletonBone width="30%" height={17} animate={animate} />
            <SkeletonBone width="36%" height={17} animate={animate} />
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <SkeletonBone width="44%" height={17} animate={animate} />
            <SkeletonBone width="22%" height={17} animate={animate} />
          </View>
        </View>
      ))}
    </View>
  );
}

function createDetailScreenSkeletonStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      gap: 14,
      paddingTop: 8,
      paddingBottom: 24,
    },
    hero: {
      padding: 16,
      gap: 8,
      borderRadius: RADIUS.lg,
    },
    heroPills: {
      flexDirection: 'row',
      gap: 8,
    },
    panel: {
      padding: 14,
      borderRadius: RADIUS.md,
    },
    panelTitle: {
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    detailRowLast: {
      paddingBottom: 0,
    },
  });
}
