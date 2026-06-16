import React, { useCallback, useState, type ReactNode } from 'react';
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
import type { CurrencyApi } from '@services/category/priceListApiTypes';

export type CurrencySelectProps = {
  label: string;
  required?: boolean;
  hint?: string;
  options: CurrencyApi[];
  valueId: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
  /** Badge / nội dung phụ bên phải chữ, trước mũi tên (vd. pill VND). */
  trailingAdornment?: ReactNode;
};

function optionLabel(c: CurrencyApi): string {
  return `${c.symbol} ${c.code}`;
}

export function CurrencySelect({
  label,
  required,
  hint,
  options,
  valueId,
  onChange,
  disabled,
  trailingAdornment,
}: CurrencySelectProps) {
  const styles = useThemeStyleSheet(create_CurrencySelect_styles);
  const palette = useAppColors();

  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const selected = options.find(o => o.id === valueId);

  const renderItem = useCallback(
    ({ item }: { item: (typeof options)[0] }) => (
      <Pressable
        style={styles.row}
        onPress={() => {
          onChange(item.id);
          close();
        }}
      >
        <Text style={styles.rowTitle}>{`${item.symbol} ${item.code} — ${item.name}`}</Text>
        {valueId === item.id ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [onChange, close, valueId, styles.row, styles.rowTitle, palette.teal],
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
          {selected ? optionLabel(selected) : 'Chọn loại tiền'}
        </Text>
        {trailingAdornment ? (
          <View style={styles.trail}>{trailingAdornment}</View>
        ) : null}
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
            <Text style={styles.sheetTitle}>Loại tiền</Text>
            <FlatList
              data={options}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function create_CurrencySelect_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 14,
      flex: 1,
      minWidth: 0,
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
      height: 48,
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
    trail: {
      marginRight: -4,
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
