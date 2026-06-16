import type { AppColorPalette } from '../../theme/colorPalettes';
import { BRAND_HEX, RADIUS } from '../../theme/designTokens';
import { SHADOW, sellerChromeCard } from '../../theme/surfaceStyles';
import { StyleSheet } from 'react-native';

/**
 * Style thống nhất cho khối «Thao tác nhanh» ở đáy màn chi tiết — gọn cho màn hình nhỏ.
 * Phần tổng quan phía trên giữ style riêng từng màn.
 */
export function createDetailQuickDockThemeStyles(c: AppColorPalette) {
  return StyleSheet.create({
    dockCard: {
      ...sellerChromeCard(c),
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    dockTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 6,
    },
    dockCol: {
      gap: 6,
    },
    /** Hai nút cạnh nhau (vd. hóa đơn). */
    dockRow: {
      flexDirection: 'row',
      gap: 8,
      width: '100%',
    },
    dockBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      width: '100%',
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    dockBtnHalf: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minWidth: 0,
      paddingVertical: 9,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    dockBtnPressed: { opacity: 0.88 },
    dockBtnPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: RADIUS.md,
      backgroundColor: BRAND_HEX,
      ...SHADOW.cardSoft,
    },
    dockBtnPrimaryLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff',
    },
    dockBtnLabel: {
      fontSize: 13,
      fontWeight: '700',
    },
    dockBtnLabelMuted: {
      opacity: 0.55,
    },
    dockBtnDisabled: { opacity: 0.45 },
  });
}
