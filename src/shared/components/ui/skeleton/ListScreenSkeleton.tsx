import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ListCardSkeleton } from './ListCardSkeleton';
import { SkeletonBone } from './SkeletonBone';

export type ListScreenSkeletonProps = {
  count?: number;
  showSectionHeader?: boolean;
  withLeading?: boolean;
  animate?: boolean;
  hasSubtitleSecondary?: boolean;
  hasDetail?: boolean;
  /** Custom row skeleton (e.g. NotificationListItemSkeleton). */
  renderItem?: () => ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Replaces ActivityIndicator on first list load (empty items). */
export function ListScreenSkeleton({
  count = 4,
  showSectionHeader = true,
  withLeading = true,
  animate = true,
  hasSubtitleSecondary = false,
  hasDetail = false,
  renderItem,
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
      {Array.from({ length: count }, (_, i) =>
        renderItem ? (
          <React.Fragment key={i}>{renderItem()}</React.Fragment>
        ) : (
          <ListCardSkeleton
            key={i}
            withLeading={withLeading}
            animate={animate}
            hasSubtitleSecondary={hasSubtitleSecondary}
            hasDetail={hasDetail}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
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
