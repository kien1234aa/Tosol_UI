import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LIST_CARD } from '../../../theme/designTokens';
import { ListMobileCardSkeleton } from './ListMobileCardSkeleton';
import { SkeletonBone } from './SkeletonBone';

export type ListScreenSkeletonProps = {
  count?: number;
  showSectionHeader?: boolean;
  withLeading?: boolean;
  /** Bật shimmer animation. Mặc định true — skeleton chỉ hiện khi màn đang focus. */
  animate?: boolean;
  hasSubtitleSecondary?: boolean;
  hasDetail?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Thay ActivityIndicator khi tải lần đầu danh sách (rows/items rỗng). */
export function ListScreenSkeleton({
  count = 4,
  showSectionHeader = true,
  withLeading = true,
  animate = true,
  hasSubtitleSecondary = false,
  hasDetail = false,
  style,
}: ListScreenSkeletonProps) {
  return (
    <View style={[styles.root, style]}>
      {showSectionHeader ? (
        <View style={styles.sectionHeader}>
          <SkeletonBone width={128} height={16} borderRadius={6} animate={animate} />
          <SkeletonBone width={72} height={11} borderRadius={4} animate={animate} />
        </View>
      ) : null}
      {Array.from({ length: count }, (_, i) => (
        <ListMobileCardSkeleton
          key={i}
          withLeading={withLeading}
          animate={animate}
          hasSubtitleSecondary={hasSubtitleSecondary}
          hasDetail={hasDetail}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: LIST_CARD.listGap,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
});
