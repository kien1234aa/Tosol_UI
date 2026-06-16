import React, { type ReactNode, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import { CompactListMobileCard } from './CompactListMobileCard';
import { createListCardLayoutStyles } from './listCardLayout';

export type CatalogListMobileCardProps = {
  title: string;
  statusPill?: ReactNode;
  icon?: SystemIconName;
  metaLines?: string[];
  onPress?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

const EMPTY_META_LINES: string[] = [];

/** Thẻ danh mục / cài đặt — tối đa 3 dòng meta sau tiêu đề. */
function CatalogListMobileCardImpl({
  title,
  statusPill,
  icon,
  metaLines = EMPTY_META_LINES,
  onPress,
  onView,
  onEdit,
}: CatalogListMobileCardProps) {
  const c = useAppColors();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const lines = metaLines.filter(l => l.trim().length > 0);
  const handlePress = onPress ?? onView;

  const titleRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {statusPill}
      {onEdit != null ? (
        <Pressable onPress={onEdit} hitSlop={6} style={layout.iconBtn}>
          <SystemIcon name="pencil" size={16} color={c.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );

  const leading = useMemo(
    () =>
      icon != null ? (
        <View
          style={[
            layout.thumb,
            { borderColor: c.borderMid, backgroundColor: c.bgInput },
          ]}
        >
          <SystemIcon name={icon} size={16} color={c.textMuted} />
        </View>
      ) : undefined,
    [icon, layout.thumb, c.borderMid, c.bgInput, c.textMuted],
  );

  return (
    <CompactListMobileCard
      title={title}
      titleRight={statusPill != null || onEdit != null ? titleRight : undefined}
      leading={leading}
      subtitle={lines[0]}
      detail={lines[1]}
      footerLeft={lines[2]}
      footerRight={lines[3]}
      onPress={handlePress ?? undefined}
    />
  );
}

export const CatalogListMobileCard = React.memo(CatalogListMobileCardImpl);
