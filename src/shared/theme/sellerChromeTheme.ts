/**
 * Token giao diện seller (khớp sellerUiDemo) — dùng toàn app sau đăng nhập.
 * Login giữ palette.bgLogin / layout riêng, không import file này.
 */
import type { ViewStyle } from 'react-native';
import type { AppColorPalette } from './colorPalettes';
import type { ThemeMode } from './colorPalettes';

export const SELLER_CHROME_PRIMARY = '#e6c75a';
export const SELLER_CHROME_PRIMARY_DARK = '#c9a83a';
/** Viền thẻ light — pha vàng kem. */
export const SELLER_CHROME_BORDER_LIGHT = '#ede4d0';
export const SELLER_CHROME_ON_PRIMARY = '#2c2416';

export const SELLER_CHROME_RADIUS = {
  lg: 20,
  md: 14,
  sm: 10,
  pill: 24,
} as const;

export const SELLER_CHROME_SHADOW = {
  shadowColor: '#2c2416',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
} as const;

export const SELLER_CHROME_PAD_H = 20;

/** Thẻ list / panel kiểu demo: trắng, viền, bóng — không vạch trái. */
export function sellerChromeCard(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: c.bgCard,
    borderRadius: SELLER_CHROME_RADIUS.md,
    borderWidth: 1,
    borderColor: mode === 'dark' ? c.border : SELLER_CHROME_BORDER_LIGHT,
  };
  if (mode === 'light') {
    return { ...base, ...SELLER_CHROME_SHADOW };
  }
  return base;
}

/** Header cong phía trên màn (demo). */
export function sellerChromeHeaderShell(c: AppColorPalette): ViewStyle {
  return {
    backgroundColor: c.teal,
    borderBottomLeftRadius: SELLER_CHROME_RADIUS.lg,
    borderBottomRightRadius: SELLER_CHROME_RADIUS.lg,
  };
}
