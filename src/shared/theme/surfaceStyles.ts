import type { ViewStyle } from 'react-native';
import type { AppColorPalette } from './colorPalettes';
import type { ThemeMode } from './colorPalettes';
import { RADIUS } from './designTokens';
import { sellerChromeCard } from './sellerChromeTheme';

export { sellerChromeCard } from './sellerChromeTheme';

/** Đổ bóng thẻ — light mode (mockup dashboard). */
export const SHADOW = {
  card: {
    shadowColor: '#1a3c44',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSoft: {
    shadowColor: '#1a3c44',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;

/** Thẻ nổi (dashboard, panel) — seller chrome. */
export function elevatedCard(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
): ViewStyle {
  return sellerChromeCard(c, mode);
}

/** Thẻ danh sách mobile — kiểu sellerUiDemo (viền + bóng, không vạch trái). */
export function listMobileCard(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
): ViewStyle {
  return {
    ...sellerChromeCard(c, mode),
    overflow: 'hidden',
  };
}

/** Khối form / section trên màn tạo-sửa. */
export function formSectionCard(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
): ViewStyle {
  return {
    ...sellerChromeCard(c, mode),
    borderRadius: RADIUS.lg,
    padding: 16,
  };
}

/** Viền trái nhấn (Recent Activity mockup). */
export function accentLeftBorder(c: AppColorPalette): ViewStyle {
  return {
    borderLeftWidth: 5,
    borderLeftColor: c.teal,
  };
}
