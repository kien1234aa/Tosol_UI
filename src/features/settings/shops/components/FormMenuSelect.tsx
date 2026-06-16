import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';

export type FormMenuOption<T extends string> = { key: T; label: string };

export type FormMenuSelectProps<T extends string> = {
  label: string;
  required?: boolean;
  hint?: string;
  sheetTitle: string;
  options: readonly FormMenuOption<T>[];
  value: T;
  onChange: (key: T) => void;
  disabled?: boolean;
  /** Ví dụ icon bút chì trước nhãn đã chọn (Sàn TMĐT). */
  leadingSlot?: ReactNode;
  /** Hiện ô tìm kiếm trong modal khi danh sách dài. */
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function FormMenuSelect<T extends string>({
  label,
  required,
  hint,
  sheetTitle,
  options,
  value,
  onChange,
  disabled,
  leadingSlot,
  searchable = false,
  searchPlaceholder = 'Tìm kiếm…',
}: FormMenuSelectProps<T>) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const close = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
  }, []);
  const selected = options.find(o => o.key === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options as FormMenuOption<T>[];
    }
    const q = searchQuery.trim().toLowerCase();
    return (options as FormMenuOption<T>[]).filter(
      o =>
        o.label.toLowerCase().includes(q) ||
        o.key.toLowerCase().includes(q),
    );
  }, [options, searchable, searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: FormMenuOption<T> }) => (
      <Pressable
        style={styles.row}
        onPress={() => {
          onChange(item.key);
          close();
        }}
      >
        <Text style={styles.rowTitle}>{item.label}</Text>
        {value === item.key ? (
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
        {leadingSlot ? <View style={styles.lead}>{leadingSlot}</View> : null}
        <Text
          style={[styles.fieldTxt, !selected && styles.fieldPh]}
          numberOfLines={2}
        >
          {selected?.label ?? 'Chọn'}
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
            <Text style={styles.sheetTitle}>{sheetTitle}</Text>
            {searchable ? (
              <View style={styles.searchWrap}>
                <SystemIcon name="search" size={16} color={palette.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={palette.textMuted}
                  autoFocus
                  clearButtonMode="while-editing"
                />
              </View>
            ) : null}
            <FlatList
              data={filteredOptions}
              keyExtractor={item => String(item.key)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptyTxt}>Không tìm thấy kết quả</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
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
      minHeight: 48,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      gap: 8,
    },
    lead: {
      marginRight: -4,
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
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: c.textPrimary,
      padding: 0,
    },
    emptyTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
      textAlign: 'center',
      paddingVertical: 24,
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
