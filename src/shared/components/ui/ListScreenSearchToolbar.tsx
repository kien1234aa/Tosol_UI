import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { BRAND_HEX, ON_BRAND } from '../../theme/designTokens';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SystemIcon } from '../icons/SystemIcon';
import { Button } from './Button';
import { TextField } from './TextField';
import { listScreenFilterToolbarShared } from './listScreenFilterToolbarShared';

export type ListScreenSearchToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  /** Nút ghost — thường là «Bộ lọc nâng cao». */
  onFilterPress?: () => void;
  filterButtonTitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshA11y?: string;
  primaryActionTitle?: string;
  onPrimaryAction?: () => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
  clearFiltersLabel?: string;
  /** Hàng phụ (dropdown nhanh, v.v.) — đặt dưới hàng nút. */
  filterSlot?: React.ReactNode;
  /** Mặc định true — một số màn chỉ lọc/refresh, không ô tìm. */
  showSearch?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Chrome danh sách thống nhất: ô tìm → hàng «Bộ lọc» + refresh + CTA → (slot) → xóa lọc.
 */
export function ListScreenSearchToolbar({
  searchPlaceholder,
  searchValue: searchValueProp,
  onSearchChange,
  onFilterPress,
  filterButtonTitle,
  onRefresh,
  refreshing = false,
  refreshA11y,
  primaryActionTitle,
  onPrimaryAction,
  filtersActive = false,
  onClearFilters,
  clearFiltersLabel,
  filterSlot,
  showSearch = true,
  style,
}: ListScreenSearchToolbarProps) {
  const { t } = useTranslation();
  const styles = useThemeStyleSheet(create_ListScreenSearchToolbar_styles);
  const palette = useAppColors();

  const [localQuery, setLocalQuery] = useState('');
  const controlled = onSearchChange != null;
  const query = controlled ? (searchValueProp ?? '') : localQuery;
  const setQuery = controlled ? onSearchChange : setLocalQuery;

  const filterTitle =
    filterButtonTitle ?? t('common.listToolbar.advancedFilter');

  const hasActionsRow =
    onFilterPress != null || onRefresh != null || onPrimaryAction != null;

  return (
    <View style={[styles.wrap, style]}>
      {showSearch ? (
        <TextField
          variant="dark"
          size="sm"
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          containerStyle={styles.searchField}
          startIcon={
            <SystemIcon name="search" size={16} color={palette.textMuted} />
          }
        />
      ) : null}

      {hasActionsRow ? (
        <View style={styles.actionsRow}>
          {onFilterPress != null ? (
            <Button
              variant="outline"
              size="sm"
              onPress={onFilterPress}
              style={styles.filterBtn}
            >
              <SystemIcon name="funnel" size={14} color={palette.teal} />
              <Text style={styles.filterBtnText}>{filterTitle}</Text>
            </Button>
          ) : null}
          <View style={styles.spacer} />
          {onRefresh != null ? (
            <Pressable
              onPress={onRefresh}
              style={[styles.iconCircle, { borderColor: palette.borderMid }]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                refreshA11y ?? t('common.listToolbar.refreshA11y')
              }
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={palette.teal} />
              ) : (
                <SystemIcon
                  name="refresh"
                  size={18}
                  color={palette.textSecondary}
                />
              )}
            </Pressable>
          ) : null}
          {onPrimaryAction != null && primaryActionTitle != null ? (
            <Button
              title={primaryActionTitle}
              variant="secondary"
              size="sm"
              onPress={onPrimaryAction}
              style={styles.primaryBtn}
              textStyle={styles.primaryBtnText}
            />
          ) : null}
        </View>
      ) : null}

      {filterSlot != null ? <View style={styles.filterSlot}>{filterSlot}</View> : null}

      {filtersActive && onClearFilters != null ? (
        <Pressable
          onPress={onClearFilters}
          style={({ pressed }) => [
            styles.clearRow,
            pressed && styles.clearRowPressed,
          ]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={
            clearFiltersLabel ?? t('common.listToolbar.clearFilters')
          }
        >
          <SystemIcon name="close" size={16} color={palette.textLink} />
          <Text style={styles.clearRowText}>
            {clearFiltersLabel ?? t('common.listToolbar.clearFilters')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function create_ListScreenSearchToolbar_styles(c: AppColorPalette) {
  const sh = listScreenFilterToolbarShared(c);
  return StyleSheet.create({
    wrap: {
      marginBottom: 12,
      gap: 8,
    },
    searchField: {
      marginBottom: 0,
    },
    actionsRow: sh.actionsRow,
    spacer: sh.actionsSpacer,
    iconCircle: sh.iconCircle,
    filterBtn: {
      gap: 6,
    },
    filterBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.teal,
    },
    primaryBtn: {
      backgroundColor: BRAND_HEX,
      borderColor: BRAND_HEX,
    },
    primaryBtnText: {
      color: ON_BRAND,
      fontWeight: '700',
    },
    filterSlot: {
      width: '100%',
    },
    clearRow: sh.clearFiltersRow,
    clearRowPressed: sh.clearFiltersRowPressed,
    clearRowText: sh.clearFiltersRowText,
  });
}
