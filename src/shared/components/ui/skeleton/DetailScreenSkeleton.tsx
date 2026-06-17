import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { SkeletonBone } from './SkeletonBone';

export type DetailScreenSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

const panelStyle = {
  borderRadius: 12,
  padding: 14,
  backgroundColor: lightTokens.background0,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: lightTokens.outline100,
};

/** Replaces center spinner on order/staff detail initial load. */
export function DetailScreenSkeleton({ style }: DetailScreenSkeletonProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={[styles.hero, panelStyle]}>
        <SkeletonBone width="55%" height={26} borderRadius={6} />
        <View style={styles.heroPills}>
          <SkeletonBone width={88} height={23} borderRadius={999} />
          <SkeletonBone width={72} height={23} borderRadius={999} />
        </View>
        <SkeletonBone width="90%" height={18} />
        <SkeletonBone width="70%" height={18} />
      </View>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.panel, panelStyle]}>
          <SkeletonBone
            width={140}
            height={17}
            borderRadius={6}
            style={styles.panelTitle}
          />
          <View style={styles.detailRow}>
            <SkeletonBone width="38%" height={17} />
            <SkeletonBone width="28%" height={17} />
          </View>
          <View style={styles.detailRow}>
            <SkeletonBone width="30%" height={17} />
            <SkeletonBone width="36%" height={17} />
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <SkeletonBone width="44%" height={17} />
            <SkeletonBone width="22%" height={17} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  hero: {
    padding: 16,
    gap: 8,
    borderRadius: 16,
  },
  heroPills: {
    flexDirection: 'row',
    gap: 8,
  },
  panel: {
    gap: 0,
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
    borderTopColor: lightTokens.outline100,
  },
  detailRowLast: {
    paddingBottom: 0,
  },
});
