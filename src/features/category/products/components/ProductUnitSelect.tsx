import React, { useCallback, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import {
  PRODUCT_UNIT_OPTIONS,
  type ProductUnitValue,
} from '../constants/productUnits';

export type ProductUnitSelectProps = {
  label: string;
  required?: boolean;
  hint?: string;
  value: ProductUnitValue | null;
  onChange: (v: ProductUnitValue) => void;
  disabled?: boolean;
};

export function ProductUnitSelect({
  label,
  required,
  hint,
  value,
  onChange,
  disabled,
}: ProductUnitSelectProps) {
  const styles = useThemeStyleSheet(create_ProductUnitSelect_styles);
  const palette = useAppColors();

  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = PRODUCT_UNIT_OPTIONS.find(o => o.value === value);

  const close = useCallback(() => setOpen(false), []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof PRODUCT_UNIT_OPTIONS)[0] }) => (
      <Pressable
        style={styles.row}
        onPress={() => {
          onChange(item.value);
          close();
        }}
      >
        <Text style={styles.rowTitle}>{item.label}</Text>
        {value === item.value ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [onChange, close, value, styles.row, styles.rowTitle, palette.teal],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[styles.field, disabled && styles.fieldDis]}
        disabled={disabled}
      >
        <Text
          style={[styles.fieldTxt, !selected && styles.fieldPh]}
          numberOfLines={1}
        >
          {selected?.label ?? 'Chọn đơn vị'}
        </Text>
        <SystemIcon name="chevronDown" size={16} color={palette.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.sheetTitle}>Đơn vị</Text>
            <FlatList
              data={PRODUCT_UNIT_OPTIONS}
              keyExtractor={item => item.value}
              renderItem={renderItem}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function create_ProductUnitSelect_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 14,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 4,
    },
    req: {
      color: c.orange,
    },
    hint: {
      fontSize: 11,
      color: c.textMuted,
      marginBottom: 6,
      lineHeight: 15,
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
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12,
      maxHeight: '72%',
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
  });
}
