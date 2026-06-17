import React from 'react';
import { StyleSheet, View } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { SkeletonBone } from './SkeletonBone';

export type NotificationListItemSkeletonProps = {
  animate?: boolean;
};

/** Matches NotificationListItem layout. */
export function NotificationListItemSkeleton({
  animate = true,
}: NotificationListItemSkeletonProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBone width={40} height={40} borderRadius={12} animate={animate} />
        <View style={styles.col}>
          <View style={styles.titleRow}>
            <SkeletonBone height={18} style={styles.titleLine} animate={animate} />
            <SkeletonBone width={8} height={8} borderRadius={4} animate={animate} />
          </View>
          <SkeletonBone height={14} width="35%" animate={animate} />
          <SkeletonBone height={16} style={styles.messageLine} animate={animate} />
          <SkeletonBone height={14} width="28%" animate={animate} />
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
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleLine: {
    flex: 1,
    maxWidth: '85%',
  },
  messageLine: {
    width: '95%',
  },
});
