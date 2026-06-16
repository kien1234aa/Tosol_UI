import { StyleSheet } from 'react-native';
import type { AppColorPalette } from '../../theme/colorPalettes';

export function createListScreenFilterModalStyles(c: AppColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    panel: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 16,
      paddingHorizontal: 16,
      gap: 12,
    },
    panelTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 4,
    },
    section: {
      gap: 6,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
    },
    ddTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderMid,
      backgroundColor: c.bgCard,
      minHeight: 40,
    },
    ddTriggerPressed: { opacity: 0.88 },
    ddTriggerTxt: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
    },
    pickerSheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12,
      maxHeight: '72%',
    },
    pickerSheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    pickerRowTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    doneBtn: {
      marginTop: 8,
      backgroundColor: c.bgCard,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: c.borderMid,
      paddingVertical: 14,
      alignItems: 'center',
    },
    doneBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
    },
  });
}
