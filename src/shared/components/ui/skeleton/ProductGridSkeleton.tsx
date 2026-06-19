import React from 'react';
import { StyleSheet, View } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { SkeletonBone } from './SkeletonBone';

export type ProductGridSkeletonProps = {
  rowCount?: number;
  columnCount?: number;
  animate?: boolean;
};

function ProductCardSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <View style={styles.cell}>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <SkeletonBone
            style={StyleSheet.absoluteFillObject}
            height={1}
            borderRadius={10}
            animate={animate}
          />
        </View>
        <View style={styles.textBlock}>
          <SkeletonBone height={14} style={styles.nameLine} animate={animate} />
          <SkeletonBone height={12} width="60%" animate={animate} />
          <SkeletonBone height={18} width="50%" animate={animate} />
        </View>
      </View>
    </View>
  );
}

/** Matches ProductCard in a responsive multi-column grid. */
export function ProductGridSkeleton({
  rowCount = 4,
  columnCount,
  animate = true,
}: ProductGridSkeletonProps) {
  const { productGridColumns, gridGap } = useResponsiveLayout();
  const columns = columnCount ?? productGridColumns;

  return (
    <View style={[styles.root, { gap: gridGap }]}>
      <SkeletonBone width={120} height={20} borderRadius={6} animate={animate} />
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: gridGap }]}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <ProductCardSkeleton
              key={`${rowIndex}-${colIndex}`}
              animate={animate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 10,
  },
  textBlock: {
    gap: 6,
  },
  nameLine: {
    width: '90%',
  },
});
