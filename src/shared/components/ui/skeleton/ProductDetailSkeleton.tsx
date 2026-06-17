import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { SkeletonBone } from './SkeletonBone';

export type ProductDetailSkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

const sectionCardStyle = {
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: lightTokens.background0,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: lightTokens.outline100,
};

/** Matches ProductDetailView layout. */
export function ProductDetailSkeleton({ style }: ProductDetailSkeletonProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.heroWrap}>
        <SkeletonBone
          style={StyleSheet.absoluteFillObject}
          height={1}
          borderRadius={16}
        />
      </View>
      <View style={styles.titleBlock}>
        <SkeletonBone height={24} width="85%" borderRadius={6} />
        <SkeletonBone height={28} width="45%" borderRadius={6} />
        <SkeletonBone height={16} width="35%" borderRadius={4} />
      </View>
      <View style={[styles.section, sectionCardStyle]}>
        <SkeletonBone height={16} width="40%" borderRadius={4} />
        {Array.from({ length: 4 }, (_, i) => (
          <View key={i} style={styles.infoRow}>
            <SkeletonBone height={16} width="42%" />
            <SkeletonBone height={16} width="28%" />
          </View>
        ))}
      </View>
      <View style={[styles.section, sectionCardStyle]}>
        <View style={styles.quantityRow}>
          <View style={styles.quantityLabels}>
            <SkeletonBone height={16} width={80} borderRadius={4} />
            <SkeletonBone height={14} width={120} borderRadius={4} />
          </View>
          <SkeletonBone width={120} height={36} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroWrap: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 320,
    overflow: 'hidden',
    borderRadius: 16,
  },
  titleBlock: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quantityLabels: {
    gap: 6,
    flex: 1,
  },
});
