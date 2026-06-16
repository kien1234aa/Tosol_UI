import { StyleSheet, type ViewStyle } from 'react-native';
import type { AppColorPalette, ThemeMode } from '../../../theme/colorPalettes';
import { useMemo } from 'react';
import { useAppColors, useThemeMode } from '../../../theme/ThemeContext';
import {
  CANVAS_SCREEN_PAD_H,
  LIST_CARD,
  RADIUS,
} from '../../../theme/designTokens';
import {
  elevatedCard,
  formSectionCard,
  SHADOW,
} from '../../../theme/surfaceStyles';

export { CANVAS_SCREEN_PAD_H };

export function canvasScreenRoot(c: AppColorPalette): ViewStyle {
  return { flex: 1, backgroundColor: c.bg };
}

/** `contentContainerStyle` cho ScrollView danh sách. */
export function canvasListScrollContent(
  extra?: ViewStyle,
): ViewStyle {
  return {
    paddingHorizontal: CANVAS_SCREEN_PAD_H,
    paddingTop: 8,
    gap: LIST_CARD.listGap,
    ...extra,
  };
}

export function createCanvasScreenThemeStyles(
  c: AppColorPalette,
  mode: ThemeMode = 'light',
) {
  const surface = elevatedCard(c, mode);
  return StyleSheet.create({
    screenRoot: canvasScreenRoot(c),
    screenPad: {
      paddingHorizontal: CANVAS_SCREEN_PAD_H,
    },
    listScroll: canvasListScrollContent(),
    formScroll: {
      paddingHorizontal: CANVAS_SCREEN_PAD_H,
      paddingTop: 12,
      paddingBottom: 24,
    },
    formSection: formSectionCard(c, mode),
    toolbarCard: {
      ...surface,
      borderRadius: RADIUS.control,
      borderWidth: 1,
      borderColor: c.borderMid,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
    },
    listStatsBand: {
      ...formSectionCard(c, mode),
      marginBottom: 12,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    listStatsBandInner: {
      width: '100%',
    },
    listToolbarShell: {
      ...formSectionCard(c, mode),
      marginBottom: 12,
      padding: 10,
    },
    listToolbarInner: {
      width: '100%',
      gap: 8,
    },
    listSection: {
      gap: LIST_CARD.listGap,
    },
    dashboardPanel: {
      ...formSectionCard(c, mode),
      marginBottom: 12,
    },
    dashboardPanelTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 10,
      letterSpacing: -0.2,
    },
    dashboardHalfPanel: {
      ...formSectionCard(c, mode),
      flex: 1,
      minHeight: 200,
      padding: 12,
    },
    promoBanner: {
      ...formSectionCard(c, mode),
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 10,
      marginBottom: 12,
      ...SHADOW.cardSoft,
    },
    placeholderCard: {
      ...formSectionCard(c, mode),
      alignItems: 'center',
      paddingVertical: 28,
    },
    placeholderTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
      textAlign: 'center',
    },
    placeholderHint: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });
}

export function useCanvasScreenStyles() {
  const c = useAppColors();
  const { mode } = useThemeMode();
  return useMemo(() => createCanvasScreenThemeStyles(c, mode), [c, mode]);
}
