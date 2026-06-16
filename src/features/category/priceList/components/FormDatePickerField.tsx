import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import {
  FilterSheetOverlay,
  useFilterSheetPortal,
  useInsideFilterSheetHost,
} from '@shared/components/ui/filterSheetHost';

function formatDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${m}/${d.getFullYear()}`;
}

export type FormDatePickerFieldProps = {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  /** Hiện nút «Bỏ chọn» — mặc định bật; tắt cho trường bắt buộc (vd. ngày đặt hàng). */
  clearable?: boolean;
  /** Gộp thêm style cho wrapper ngoài (vd. `marginBottom: 0` trong lưới). */
  wrapStyle?: StyleProp<ViewStyle>;
};

export function FormDatePickerField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled,
  clearable = true,
  wrapStyle,
}: FormDatePickerFieldProps) {
  const styles = useThemeStyleSheet(create_FormDatePickerField_styles);
  const palette = useAppColors();
  const { mode } = useThemeMode();

  const insets = useSafeAreaInsets();
  const inFilterHost = useInsideFilterSheetHost();
  const setFilterPortal = useFilterSheetPortal();
  const [iosOpen, setIosOpen] = useState(false);
  const [iosDraft, setIosDraft] = useState<Date>(() => value ?? new Date());

  const openAndroid = useCallback(() => {
    if (disabled) {
      return;
    }
    const base = value ?? new Date();
    DateTimePickerAndroid.open({
      value: base,
      onChange: (event: DateTimePickerEvent, date?: Date) => {
        if (event.type !== 'set' || !date) {
          return;
        }
        onChange(date);
      },
      mode: 'date',
      minimumDate,
      maximumDate,
    });
  }, [disabled, value, onChange, minimumDate, maximumDate]);

  const openIos = useCallback(() => {
    if (disabled) {
      return;
    }
    setIosDraft(value ?? new Date());
    setIosOpen(true);
  }, [disabled, value]);

  const onPressField = useCallback(() => {
    if (Platform.OS === 'android') {
      openAndroid();
    } else {
      openIos();
    }
  }, [openAndroid, openIos]);

  const commitIos = useCallback(() => {
    onChange(iosDraft);
    setIosOpen(false);
  }, [iosDraft, onChange]);

  const cancelIos = useCallback(() => {
    setIosOpen(false);
  }, []);

  const iosSheetStyle = useMemo(
    () => [styles.sheet, { paddingBottom: insets.bottom + 12 }],
    [styles.sheet, insets.bottom],
  );

  const usePortalOverlay =
    Platform.OS === 'ios' && inFilterHost && setFilterPortal != null;

  const renderIosPickerSheet = useCallback(
    () => (
      <FilterSheetOverlay
        visible
        onClose={cancelIos}
        inline={inFilterHost}
        sheetStyle={iosSheetStyle}
      >
        <View style={styles.iosBar}>
          <Pressable onPress={cancelIos} hitSlop={12}>
            <Text style={styles.iosBarBtn}>Hủy</Text>
          </Pressable>
          <Text style={styles.iosTitle}>{label}</Text>
          <Pressable onPress={commitIos} hitSlop={12}>
            <Text style={[styles.iosBarBtn, styles.iosBarDone]}>Xong</Text>
          </Pressable>
        </View>
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={iosDraft}
            mode="date"
            display="spinner"
            locale="vi-VN"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            themeVariant={mode === 'dark' ? 'dark' : 'light'}
            style={styles.picker}
            onChange={(_, d) => {
              if (d) {
                setIosDraft(d);
              }
            }}
          />
        </View>
      </FilterSheetOverlay>
    ),
    [
      cancelIos,
      commitIos,
      inFilterHost,
      iosDraft,
      iosSheetStyle,
      label,
      maximumDate,
      minimumDate,
      mode,
      styles.iosBar,
      styles.iosBarBtn,
      styles.iosBarDone,
      styles.iosTitle,
      styles.picker,
      styles.pickerWrap,
    ],
  );

  useEffect(() => {
    if (!usePortalOverlay || !setFilterPortal || !iosOpen) {
      return;
    }
    setFilterPortal(renderIosPickerSheet());
    return () => setFilterPortal(null);
  }, [usePortalOverlay, setFilterPortal, iosOpen, renderIosPickerSheet]);

  return (
    <View style={[styles.wrap, wrapStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {clearable && value != null && !disabled ? (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <Text style={styles.clear}>Bỏ chọn</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={onPressField}
        style={[styles.field, disabled && styles.fieldDis]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.calGlyphSlot}>
          <SystemIcon name="calendar" size={18} color={palette.textMuted} />
        </View>
        <Text
          style={[styles.fieldTxt, value == null && styles.fieldPh]}
          numberOfLines={1}
        >
          {value != null ? formatDisplay(value) : 'Chọn ngày'}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && !usePortalOverlay && iosOpen
        ? renderIosPickerSheet()
        : null}
    </View>
  );
}

function create_FormDatePickerField_styles(c: AppColorPalette) {
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
    fieldDis: {
      opacity: 0.55,
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
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 8,
    },
    iosBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    iosBarBtn: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textSecondary,
      minWidth: 56,
    },
    iosBarDone: {
      color: c.cyan,
      textAlign: 'right',
    },
    iosTitle: {
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
