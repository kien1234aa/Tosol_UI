import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import { LIST_CARD, RADIUS } from '../../../theme/designTokens';
import { listMobileCard } from '../../../theme/surfaceStyles';
import { useAppColors, useThemeMode } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import { SkeletonBone } from './SkeletonBone';

export type ListMobileCardSkeletonProps = {
  withLeading?: boolean;
  animate?: boolean;
  /** Hiển thị dòng subtitleSecondary (SP thứ 2 / +N sản phẩm khác). */
  hasSubtitleSecondary?: boolean;
  /** Hiển thị dòng detail / metaLine. Tắt cho list không dùng trường này. */
  hasDetail?: boolean;
};

/** Khớp layout CompactListMobileCard / OrderListMobileCard. */
export function ListMobileCardSkeleton({
  withLeading = true,
  animate = false,
  hasSubtitleSecondary = false,
  hasDetail = false,
}: ListMobileCardSkeletonProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createListMobileCardSkeletonStyles);
  const cardSurface = listMobileCard(c, mode);

  return (
    <View style={[styles.card, cardSurface]}>
      <View style={styles.row}>
        {withLeading ? (
          <SkeletonBone
            width={LIST_CARD.thumbSize}
            height={LIST_CARD.thumbSize}
            borderRadius={RADIUS.sm}
            animate={animate}
          />
        ) : null}
        <View style={styles.col}>
          <View style={styles.titleRow}>
            <SkeletonBone height={19} style={styles.titleLine} animate={animate} />
            <SkeletonBone
              width={56}
              height={18}
              borderRadius={RADIUS.pill}
              animate={animate}
            />
          </View>
          <SkeletonBone height={18} style={styles.subtitleLine} animate={animate} />
          {hasSubtitleSecondary ? (
            <SkeletonBone height={17} style={styles.subtitleSecondaryLine} animate={animate} />
          ) : null}
          {hasDetail ? (
            <SkeletonBone height={17} style={styles.detailLine} animate={animate} />
          ) : null}
          <View style={styles.footerRow}>
            <SkeletonBone height={17} style={styles.footerLeft} animate={animate} />
            <SkeletonBone width={72} height={19} animate={animate} />
          </View>
        </View>
      </View>
    </View>
  );
}

function createListMobileCardSkeletonStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      paddingHorizontal: LIST_CARD.padH,
      paddingVertical: LIST_CARD.padV,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: LIST_CARD.leadingGap,
    },
    col: {
      flex: 1,
      minWidth: 0,
      gap: LIST_CARD.lineGap,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    titleLine: {
      flex: 1,
      maxWidth: '72%',
    },
    subtitleLine: {
      width: '88%',
    },
    subtitleSecondaryLine: {
      width: '68%',
    },
    detailLine: {
      width: '55%',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 2,
    },
    footerLeft: {
      flex: 1,
      maxWidth: '42%',
    },
  });
}
