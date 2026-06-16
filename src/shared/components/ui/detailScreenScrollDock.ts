import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type { AppColorPalette } from '../../theme/colorPalettes';

/** Padding đáy nội dung scroll chính (vùng an toàn + chừa đủ cho nội dung cuối). */
export function detailScreenScrollBottomInset(insetsBottom: number): number {
  return Math.max(insetsBottom, 12) + 16;
}

/** Viền trên + lề cho khối «Thao tác nhanh» nằm cuối scroll (đồng bộ màn chi tiết). */
export function createDetailQuickDockInScrollSectionStyles(c: AppColorPalette) {
  return StyleSheet.create({
    section: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
  });
}

export const detailScreenMainScrollContentTopPad: ViewStyle = {
  paddingTop: 4,
};

/** Tab panel: không padding ngang — thẻ canvas/DetailCard tự căn 16px. */
export const detailScreenTabPanelsPad: ViewStyle = {
  paddingTop: 4,
};
