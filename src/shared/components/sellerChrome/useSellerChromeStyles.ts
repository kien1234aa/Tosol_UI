import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { AppColorPalette, ThemeMode } from '../../theme/colorPalettes';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';
import { ON_BRAND } from '../../theme/designTokens';
import {
  SELLER_CHROME_PAD_H,
  SELLER_CHROME_RADIUS,
  SELLER_CHROME_SHADOW,
  sellerChromeCard,
  sellerChromeHeaderShell,
} from '../../theme/sellerChromeTheme';

export function useSellerChromeStyles() {
  const c = useAppColors();
  const { mode } = useThemeMode();
  return useMemo(() => createSellerChromeStyles(c, mode), [c, mode]);
}

export function createSellerChromeStyles(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
) {
  const card = sellerChromeCard(c, mode);
  const accentSoft =
    mode === 'dark' ? 'rgba(230, 199, 90, 0.22)' : 'rgba(230, 199, 90, 0.22)';

  return StyleSheet.create({
    screenRoot: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scrollContent: {
      padding: SELLER_CHROME_PAD_H,
      paddingBottom: 28,
      gap: 4,
    },
    headerShell: sellerChromeHeaderShell(c),
    headerPad: {
      paddingHorizontal: SELLER_CHROME_PAD_H,
      paddingBottom: 16,
    },
    headerPadCompact: {
      paddingHorizontal: SELLER_CHROME_PAD_H,
      paddingBottom: 6,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: ON_BRAND,
    },
    headerTitleCompact: {
      fontSize: 20,
      fontWeight: '800',
      color: ON_BRAND,
    },
    headerSubtitle: {
      fontSize: 13,
      color:
        mode === 'dark' ? 'rgba(255,255,255,0.78)' : 'rgba(44,36,22,0.72)',
      marginTop: 4,
    },
    headerIconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor:
        mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(44,36,22,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.bgCard,
      borderRadius: SELLER_CHROME_RADIUS.pill,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: c.textPrimary,
      padding: 0,
    },
    chromeStrip: {
      paddingHorizontal: SELLER_CHROME_PAD_H,
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: c.bg,
    },
    listCard: {
      ...card,
      padding: 14,
      marginBottom: 10,
    },
    listCardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
    listCardSubtitle: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 4,
      marginBottom: 10,
    },
    listCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    listCardMeta: {
      fontSize: 12,
      color: c.textMuted,
    },
    listCardAccent: {
      fontSize: 15,
      fontWeight: '700',
      color: c.teal,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: SELLER_CHROME_RADIUS.pill,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      marginRight: 8,
    },
    chipActive: {
      backgroundColor: c.teal,
      borderColor: c.teal,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    chipTextActive: {
      color: ON_BRAND,
    },
    primaryPillBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: c.teal,
      borderRadius: SELLER_CHROME_RADIUS.pill,
      paddingVertical: 14,
      marginBottom: 14,
      ...SELLER_CHROME_SHADOW,
    },
    primaryPillBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: ON_BRAND,
    },
    metricTile: {
      width: '48%',
      ...card,
      padding: 12,
      gap: 4,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    metricLabel: {
      fontSize: 11,
      color: c.textSecondary,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.textPrimary,
      marginTop: 14,
      marginBottom: 10,
    },
    featureTile: {
      width: '48%',
      ...card,
      padding: 12,
    },
    featureTile3: {
      width: '31%',
      padding: 10,
    },
    featureIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    featureLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 2,
    },
    featureHint: {
      fontSize: 11,
      color: c.textMuted,
      lineHeight: 15,
    },
    bannerSoft: {
      backgroundColor: mode === 'dark' ? c.bgRow : '#fff6dc',
      borderRadius: SELLER_CHROME_RADIUS.md,
      padding: 14,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: mode === 'dark' ? c.border : 'rgba(201, 168, 58, 0.35)',
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 12,
      backgroundColor: c.bgCard,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    detailHeaderTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: c.textPrimary,
    },
    detailSectionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 10,
    },
  });
}
