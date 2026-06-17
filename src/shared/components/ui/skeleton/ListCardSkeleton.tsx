import React from 'react';
import { StyleSheet, View } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { SkeletonBone } from './SkeletonBone';

const THUMB_SIZE = 72;

export type ListCardSkeletonProps = {
  withLeading?: boolean;
  animate?: boolean;
  hasSubtitleSecondary?: boolean;
  hasDetail?: boolean;
};

/** Matches OrderListCard / StaffListCard layout. */
export function ListCardSkeleton({
  withLeading = true,
  animate = true,
  hasSubtitleSecondary = false,
  hasDetail = false,
}: ListCardSkeletonProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {withLeading ? (
          <SkeletonBone
            width={THUMB_SIZE}
            height={THUMB_SIZE}
            borderRadius={10}
            animate={animate}
          />
        ) : null}
        <View style={styles.col}>
          <View style={styles.titleRow}>
            <SkeletonBone height={19} style={styles.titleLine} animate={animate} />
            <SkeletonBone
              width={56}
              height={18}
              borderRadius={999}
              animate={animate}
            />
          </View>
          <SkeletonBone height={18} style={styles.subtitleLine} animate={animate} />
          {hasSubtitleSecondary ? (
            <SkeletonBone
              height={17}
              style={styles.subtitleSecondaryLine}
              animate={animate}
            />
          ) : null}
          {hasDetail ? (
            <>
              <SkeletonBone height={17} style={styles.detailLine} animate={animate} />
              <SkeletonBone height={17} style={styles.detailLineShort} animate={animate} />
            </>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  col: {
    flex: 1,
    minWidth: 0,
    gap: 8,
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
    width: '100%',
  },
  detailLineShort: {
    width: '75%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  footerLeft: {
    flex: 1,
    maxWidth: '42%',
  },
});
