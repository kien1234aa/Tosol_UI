import { StyleSheet } from 'react-native';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import { LIST_CARD, RADIUS } from '../../../theme/designTokens';

/** Style dùng chung cho thẻ danh sách mobile — gọn, ít dòng. */
export function createListCardLayoutStyles(c: AppColorPalette) {
  const ab = LIST_CARD.actionBtn;
  return StyleSheet.create({
    card: {
      overflow: 'hidden',
    },
    /** Header phẳng (không nền table header). */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: LIST_CARD.headerGap,
      paddingHorizontal: LIST_CARD.headerPadH,
      paddingVertical: LIST_CARD.headerPadV,
      minWidth: 0,
    },
    headerTitle: {
      flex: 1,
      fontSize: LIST_CARD.fontTitle,
      fontWeight: '700',
      minWidth: 0,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
    },
    body: {
      paddingHorizontal: LIST_CARD.bodyPadH,
      paddingBottom: LIST_CARD.bodyPadV,
      paddingTop: LIST_CARD.bodyPadV,
      gap: LIST_CARD.bodyGap,
    },
    bodyTight: {
      paddingHorizontal: LIST_CARD.bodyPadH,
      paddingVertical: LIST_CARD.bodyPadV,
      gap: LIST_CARD.bodyGap,
    },
    meta: {
      fontSize: LIST_CARD.fontMeta,
      lineHeight: LIST_CARD.fontMeta + 3,
      color: c.textMuted,
    },
    metaSecondary: {
      fontSize: LIST_CARD.fontMeta,
      lineHeight: LIST_CARD.fontMeta + 3,
      color: c.textSecondary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: LIST_CARD.headerGap,
      minWidth: 0,
    },
    thumb: {
      width: LIST_CARD.thumbSize,
      height: LIST_CARD.thumbSize,
      borderRadius: RADIUS.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderMid,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgInput,
    },
    thumbImg: {
      width: '100%',
      height: '100%',
    },
    iconBtn: {
      width: ab,
      height: ab,
      borderRadius: ab / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chevronHit: {
      padding: 2,
    },
  });
}

export type ListCardLayoutStyles = ReturnType<typeof createListCardLayoutStyles>;
