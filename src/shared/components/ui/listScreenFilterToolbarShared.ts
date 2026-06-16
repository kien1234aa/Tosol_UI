import type { TextStyle, ViewStyle } from 'react-native';
import type { AppColorPalette, ThemeMode } from '../../theme/colorPalettes';
import { SHADOW } from '../../theme/surfaceStyles';

/**
 * Layout dùng chung danh sách: ô tìm full width (hàng 1), nút dropdown lọc cùng một hàng (hàng 2), chiều cao gọn.
 * Dùng với `TextField` `size="sm"` (40px) và icon tìm ~16.
 */
function filterChipSurface(c: AppColorPalette, mode: ThemeMode = 'light') {
  if (mode === 'dark') {
    return {
      backgroundColor: c.bgCard,
      borderColor: c.border,
    };
  }
  return {
    backgroundColor: c.bgCard,
    borderColor: c.borderMid,
    ...SHADOW.cardSoft,
  };
}

export function listScreenFilterToolbarShared(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
) {
  const chip = filterChipSurface(c, mode);
  return {
    searchRowFull: {
      width: '100%' as const,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    } satisfies ViewStyle,
    filtersRow: {
      flexDirection: 'row' as const,
      alignItems: 'stretch' as const,
      gap: 8,
      width: '100%' as const,
    } satisfies ViewStyle,
    /** Hai (hoặc nhiều) dropdown chia đều chiều ngang. */
    ddWrapEqual: {
      flex: 1,
      minWidth: 0,
    } satisfies ViewStyle,
    ddTriggerCompact: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      minHeight: 40,
      ...chip,
    } satisfies ViewStyle,
    ddTriggerTxtCompact: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600' as const,
      color: c.textSecondary,
    } satisfies TextStyle,
    chipCompact: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      ...chip,
    } satisfies ViewStyle,
    chipRowActions: {
      flexDirection: 'row' as const,
      alignItems: 'stretch' as const,
      gap: 8,
      width: '100%' as const,
    } satisfies ViewStyle,
    /** Hàng nút: bộ lọc + refresh + CTA (giống OrdersSearchToolbar). */
    actionsRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: 2,
      minWidth: 0,
    } satisfies ViewStyle,
    actionsSpacer: {
      flex: 1,
    } satisfies ViewStyle,
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: 8,
    } satisfies ViewStyle,
    clearFiltersRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      alignSelf: 'flex-start' as const,
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 2,
    } satisfies ViewStyle,
    clearFiltersRowPressed: {
      opacity: 0.75,
    } satisfies ViewStyle,
    clearFiltersRowText: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: c.textLink,
    } satisfies TextStyle,
    countText: {
      fontSize: 12,
      marginTop: 4,
    } satisfies TextStyle,
  };
}
