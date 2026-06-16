import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import type { ThemeMode } from '../../../theme/colorPalettes';
import { useAppColors, useThemeMode } from '../../../theme/ThemeContext';
import { BRAND_HEX, RADIUS } from '../../../theme/designTokens';
import { SHADOW, elevatedCard } from '../../../theme/surfaceStyles';
import { CANVAS_SCREEN_PAD_H } from '../../../theme/designTokens';

export function useCanvasDetailStyles() {
  const c = useAppColors();
  const { mode } = useThemeMode();
  return useMemo(() => createCanvasDetailThemeStyles(c, mode), [c, mode]);
}

/** Style thẻ chi tiết kiểu dashboard (viền trái teal, bóng nhẹ). */
export function createCanvasDetailThemeStyles(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
) {
  const surface = elevatedCard(c, mode);
  return StyleSheet.create({
    screenPad: {
      paddingHorizontal: CANVAS_SCREEN_PAD_H,
    },
    blockGap: {
      marginBottom: 12,
    },
    heroCard: {
      ...surface,
      borderRadius: RADIUS.lg,
      padding: 16,
      overflow: 'hidden',
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    heroBody: {
      flex: 1,
      minWidth: 0,
      gap: 8,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.3,
      lineHeight: 26,
    },
    heroSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    healthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    healthLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    healthValue: {
      fontSize: 12,
      fontWeight: '800',
      color: c.teal,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    metricRow: {
      flexDirection: 'row',
      gap: 10,
    },
    metricCard: {
      flex: 1,
      minWidth: 0,
      ...surface,
      borderRadius: RADIUS.md,
      padding: 14,
    },
    heroFooter: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.2,
    },
    lineItemCard: {
      flexDirection: 'row',
      gap: 12,
      ...surface,
      borderRadius: RADIUS.md,
      padding: 12,
    },
    lineItemThumb: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.md,
      backgroundColor: c.bgInput,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderMid,
    },
    lineItemThumbPh: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    lineItemBody: { flex: 1, minWidth: 0, gap: 4 },
    lineItemHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    lineItemTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
      lineHeight: 19,
    },
    lineItemSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    lineItemProgressWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    lineItemProgressTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
    },
    lineItemProgressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: BRAND_HEX,
    },
    lineItemProgressPct: {
      fontSize: 11,
      fontWeight: '800',
      color: c.teal,
      minWidth: 32,
      textAlign: 'right',
    },
    lineItemMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 17,
    },
    lineItemFooter: {
      fontSize: 13,
      fontWeight: '900',
      color: c.teal,
      marginTop: 2,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 6,
    },
    metricValue: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.3,
    },
    metricIconSlot: {
      position: 'absolute',
      top: 12,
      right: 12,
      opacity: 0.85,
    },
    bannerCard: {
      ...surface,
      borderRadius: RADIUS.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    bannerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    bannerLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.35,
      marginBottom: 4,
    },
    bannerValue: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
    },
    bannerHint: {
      fontSize: 13,
      fontWeight: '700',
      color: c.teal,
    },
    progressCard: {
      ...surface,
      borderRadius: RADIUS.md,
      padding: 14,
    },
    progressTitle: {
      fontSize: 10,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    progressItem: {
      marginBottom: 12,
    },
    progressItemLast: {
      marginBottom: 0,
    },
    progressHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textPrimary,
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    progressPct: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textSecondary,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: BRAND_HEX,
    },
    panelCard: {
      ...surface,
      borderRadius: RADIUS.lg,
      padding: 14,
      marginBottom: 12,
    },
    panelTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    panelTitle: {
      flex: 1,
      fontSize: 12,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.45,
      textTransform: 'uppercase',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    detailLab: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      maxWidth: '46%',
    },
    detailVal: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      textAlign: 'right',
    },
    sectionHeaderBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    sectionTitleLg: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: '700',
      color: c.teal,
    },
    accentListCard: {
      ...surface,
      borderRadius: RADIUS.md,
      padding: 12,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderMid,
    },
    accentListBody: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    accentListTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
    },
    accentListMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    primaryBtn: {
      backgroundColor: BRAND_HEX,
      borderRadius: RADIUS.md,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      ...(mode === 'light' ? SHADOW.cardSoft : {}),
    },
    primaryBtnLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff',
    },
  });
}

export type CanvasDetailThemeStyles = ReturnType<
  typeof createCanvasDetailThemeStyles
>;
