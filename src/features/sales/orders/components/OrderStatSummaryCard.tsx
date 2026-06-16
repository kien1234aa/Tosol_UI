import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { SystemIcon } from '@shared/components/icons/SystemIcon';

export type OrderStatSummaryCardProps = {
  icon: SystemIconName;
  value: string | number | null;
  label: string;
  iconBg: string;
  iconColor: string;
  onFilterPress?: () => void;
  /** Ẩn nút lọc (vd. thẻ “Tất cả” trên màn sản phẩm). */
  hideFilter?: boolean;
  /** Ô đang khớp bộ lọc danh sách. */
  selected?: boolean;
  /** Đang tải số liệu (thống kê). */
  countLoading?: boolean;
  /** Trong lưới ô cố định: kéo full chiều ngang ô, tránh `flex:1` chồng layout. */
  fillWidth?: boolean;
};

export function OrderStatSummaryCard({
  icon,
  value,
  label,
  iconBg,
  iconColor,
  onFilterPress,
  hideFilter,
  selected,
  countLoading,
  fillWidth: _fillWidth,
}: OrderStatSummaryCardProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_OrderStatSummaryCard_styles);

  const display =
    value === null
      ? '–'
      : typeof value === 'number'
      ? value.toLocaleString('vi-VN')
      : value;
  return (
    <View
      style={[
        styles.card,
        selected && { borderColor: palette.cyan, borderWidth: 2 },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <SystemIcon name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.mid}>
        {countLoading ? (
          <ActivityIndicator
            size="small"
            color={palette.cyan}
            style={styles.countSpin}
          />
        ) : (
          <Text style={styles.value}>{display}</Text>
        )}
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
      {hideFilter ? (
        <View style={styles.filterSpacer} />
      ) : (
        <Pressable
          onPress={onFilterPress}
          style={styles.filterBtn}
          hitSlop={8}
          accessibilityLabel="Loc theo trang thai"
        >
          <SystemIcon name="funnel" size={15} color={palette.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

function create_OrderStatSummaryCard_styles(c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 140,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 10,
      paddingHorizontal: 10,
      gap: 10,
    },
    cardFillWidth: {
      flex: 0,
      flexGrow: 0,
      alignSelf: 'stretch',
      width: '100%',
      minWidth: 0,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mid: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    countSpin: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
    },
    value: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textPrimary,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    filterBtn: {
      padding: 4,
    },
    filterSpacer: {
      width: 24,
    },
    filterIcon: {
      fontSize: 16,
      color: c.textMuted,
      fontWeight: '600',
    },
  });
}
