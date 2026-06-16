import React, { useCallback } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
export type ListPaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
};

export type ListPaginationBarProps = {
  meta: ListPaginationMeta | null | undefined;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  /** Giá trị chọn trong menu "Mỗi trang". */
  perPageOptions?: number[];
};

const DEFAULT_PER_OPTIONS = [15, 30, 50];

type PaginationBarStyles = ReturnType<typeof create_ListPaginationBar_styles>;

function PaginationNavIcon({
  label,
  disabled,
  onPress,
  styles,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  styles: PaginationBarStyles;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.navBtn,
        disabled && styles.navBtnDisabled,
        pressed && !disabled && styles.navBtnPressed,
      ]}
    >
      <Text style={[styles.navBtnTxt, disabled && styles.navBtnTxtDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ListPaginationBar({
  meta,
  loading,
  onPageChange,
  onPerPageChange,
  perPageOptions = DEFAULT_PER_OPTIONS,
}: ListPaginationBarProps) {
  const styles = useThemeStyleSheet(create_ListPaginationBar_styles);
  const palette = useAppColors();

  function rangeLabel(meta: ListPaginationMeta): string {
    const { total, current_page, per_page, from, to } = meta;
    if (total <= 0) {
      return '0 of 0';
    }
    const start =
      from != null && from > 0 ? from : (current_page - 1) * per_page + 1;
    const end =
      to != null && to > 0 ? to : Math.min(current_page * per_page, total);
    return `${start}-${end} of ${total.toLocaleString('en-US')}`;
  }

  const openPerPageMenu = useCallback(() => {
    Alert.alert('Mỗi trang', 'Số bản ghi mỗi trang', [
      ...perPageOptions.map(n => ({
        text: String(n),
        onPress: () => onPerPageChange(n),
      })),
      { text: 'Hủy', style: 'cancel' as const },
    ]);
  }, [onPerPageChange, perPageOptions]);

  if (meta == null) {
    return null;
  }

  const page = meta.current_page;
  const last = Math.max(1, meta.last_page);
  const per = meta.per_page;

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.perLabel}>Mỗi trang</Text>
        <Pressable
          onPress={openPerPageMenu}
          disabled={loading}
          style={({ pressed }) => [
            styles.perChip,
            pressed && styles.perChipPressed,
          ]}
        >
          <Text style={styles.perChipTxt}>{per}</Text>
          <SystemIcon name="chevronDown" size={12} color={palette.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.range}>{rangeLabel(meta)}</Text>

      <View style={styles.navRow}>
        <PaginationNavIcon
          label="|←"
          disabled={loading || page <= 1}
          onPress={() => onPageChange(1)}
          styles={styles}
        />
        <PaginationNavIcon
          label="←"
          disabled={loading || page <= 1}
          onPress={() => onPageChange(page - 1)}
          styles={styles}
        />
        <PaginationNavIcon
          label="→"
          disabled={loading || page >= last}
          onPress={() => onPageChange(page + 1)}
          styles={styles}
        />
        <PaginationNavIcon
          label="→|"
          disabled={loading || page >= last}
          onPress={() => onPageChange(last)}
          styles={styles}
        />
      </View>
    </View>
  );
}

function create_ListPaginationBar_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    perLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    perChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    perChipPressed: {
      opacity: 0.85,
    },
    perChipTxt: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      minWidth: 20,
      textAlign: 'center',
    },
    range: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      flex: 1,
      textAlign: 'center',
      minWidth: 100,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    navBtn: {
      minWidth: 36,
      height: 34,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navBtnPressed: {
      opacity: 0.88,
    },
    navBtnDisabled: {
      opacity: 0.35,
    },
    navBtnTxt: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
    },
    navBtnTxtDisabled: {
      color: c.textMuted,
    },
  });
}
