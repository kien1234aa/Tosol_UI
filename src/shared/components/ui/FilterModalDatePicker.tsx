import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '../icons/SystemIcon';
import { FilterSheetOverlay } from './filterSheetHost';

function formatDateDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${m}/${d.getFullYear()}`;
}

export type FilterModalDateFieldProps = {
  label: string;
  value: Date | null;
  onPress: () => void;
  onClear: () => void;
  wrapStyle?: StyleProp<ViewStyle>;
  clearLabel?: string;
  placeholder?: string;
};

export function FilterModalDateField({
  label,
  value,
  onPress,
  onClear,
  wrapStyle,
  clearLabel = 'Bỏ chọn',
  placeholder = 'Chọn ngày',
}: FilterModalDateFieldProps) {
  const palette = useAppColors();
  const st = useThemeStyleSheet(createFieldStyles);

  return (
    <View style={[st.wrap, wrapStyle]}>
      <View style={st.labelRow}>
        <Text style={st.label}>{label}</Text>
        {value != null ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Text style={st.clear}>{clearLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={onPress}
        style={st.field}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={st.calGlyphSlot}>
          <SystemIcon name="calendar" size={18} color={palette.textMuted} />
        </View>
        <Text
          style={[st.fieldTxt, value == null && st.fieldPh]}
          numberOfLines={1}
        >
          {value != null ? formatDateDisplay(value) : placeholder}
        </Text>
      </Pressable>
    </View>
  );
}

export type FilterModalDateSheetProps = {
  visible: boolean;
  title: string;
  draft: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDraftChange: (d: Date) => void;
  onCommit: () => void;
  onClose: () => void;
  cancelLabel?: string;
  doneLabel?: string;
};

/** Sheet chọn ngày — đặt cùng cấp OptionsModal trong modal lọc nâng cao. */
export function FilterModalDateSheet({
  visible,
  title,
  draft,
  minimumDate,
  maximumDate,
  onDraftChange,
  onCommit,
  onClose,
  cancelLabel = 'Hủy',
  doneLabel = 'Xong',
}: FilterModalDateSheetProps) {
  const insets = useSafeAreaInsets();
  const { mode } = useThemeMode();
  const st = useThemeStyleSheet(createSheetStyles);

  return (
    <FilterSheetOverlay
      visible={visible}
      onClose={onClose}
      inline
      sheetStyle={[st.sheet, { paddingBottom: insets.bottom + 12 }]}
    >
      <View style={st.bar}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={st.barBtn}>{cancelLabel}</Text>
        </Pressable>
        <Text style={st.barTitle}>{title}</Text>
        <Pressable onPress={onCommit} hitSlop={12}>
          <Text style={[st.barBtn, st.barDone]}>{doneLabel}</Text>
        </Pressable>
      </View>
      <View style={st.pickerWrap}>
        <DateTimePicker
          value={draft}
          mode="date"
          display="spinner"
          locale="vi-VN"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          themeVariant={mode === 'dark' ? 'dark' : 'light'}
          style={st.picker}
          onChange={(_, d) => {
            if (d) {
              onDraftChange(d);
            }
          }}
        />
      </View>
    </FilterSheetOverlay>
  );
}

function createFieldStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 14,
      flex: 1,
      minWidth: 0,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      flex: 1,
    },
    clear: {
      fontSize: 12,
      fontWeight: '600',
      color: c.cyan,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    calGlyphSlot: { marginRight: 8, justifyContent: 'center' },
    fieldTxt: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    fieldPh: {
      color: c.textMuted,
      fontWeight: '500',
    },
  });
}

function createSheetStyles(c: AppColorPalette) {
  return StyleSheet.create({
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 8,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    barBtn: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textSecondary,
      minWidth: 56,
    },
    barDone: {
      color: c.cyan,
      textAlign: 'right',
    },
    barTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
    },
    pickerWrap: {
      width: '100%',
      height: 216,
    },
    picker: {
      width: '100%',
      height: 216,
    },
  });
}
