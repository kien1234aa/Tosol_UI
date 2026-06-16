import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '../icons/SystemIcon';
import {
  FilterSheetOverlay,
  useFilterSheetPortal,
  useInsideFilterSheetHost,
} from './filterSheetHost';
import { useListScreenFilterPickerSession } from './listScreenFilterPickerSession';
import { createListScreenFilterModalStyles } from './listScreenFilterModalStyles';

export type ListScreenFilterOption<T extends string = string> = {
  key: T;
  label: string;
};

export type ListScreenFilterPickerSectionProps<T extends string = string> = {
  title: string;
  value: T;
  options: ListScreenFilterOption<T>[];
  onChange: (key: T) => void;
};

/** Một nhóm lọc trong sheet — chọn từ danh sách bottom sheet phụ. */
export function ListScreenFilterPickerSection<T extends string = string>({
  title,
  value,
  options,
  onChange,
}: ListScreenFilterPickerSectionProps<T>) {
  const styles = useThemeStyleSheet(createListScreenFilterModalStyles);
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const inFilterHost = useInsideFilterSheetHost();
  const setFilterPortal = useFilterSheetPortal();
  const session = useListScreenFilterPickerSession();
  const pickerKey = useMemo(() => `filter-picker:${title}`, [title]);
  const [localOpen, setLocalOpen] = useState(false);

  const open = session != null ? session.activeKey === pickerKey : localOpen;
  const close = useCallback(() => {
    if (session != null) {
      session.requestClose();
    } else {
      setLocalOpen(false);
    }
  }, [session]);

  const handleOpen = useCallback(() => {
    if (session != null) {
      session.requestOpen(pickerKey);
    } else {
      setLocalOpen(true);
    }
  }, [session, pickerKey]);

  const selected = options.find(o => o.key === value);

  const usePortalOverlay =
    Platform.OS === 'ios' && inFilterHost && setFilterPortal != null;

  const sheetStyle = useMemo(
    () => [styles.pickerSheet, { paddingBottom: insets.bottom + 16 }],
    [styles.pickerSheet, insets.bottom],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListScreenFilterOption<T> }) => (
      <Pressable
        style={styles.pickerRow}
        onPress={() => {
          onChange(item.key);
          close();
        }}
      >
        <Text style={styles.pickerRowTitle}>{item.label}</Text>
        {value === item.key ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [onChange, close, value, styles.pickerRow, styles.pickerRowTitle, palette.teal],
  );

  const pickerSheet = useMemo(
    () => (
      <FilterSheetOverlay visible onClose={close} inline sheetStyle={sheetStyle}>
        <Text style={styles.pickerSheetTitle}>{title}</Text>
        <FlatList
          data={options}
          keyExtractor={item => item.key}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
        />
      </FilterSheetOverlay>
    ),
    [close, sheetStyle, title, options, renderItem, styles.pickerSheetTitle],
  );

  useEffect(() => {
    if (!usePortalOverlay || !setFilterPortal || !open) {
      return;
    }
    setFilterPortal(pickerSheet);
    return () => setFilterPortal(null);
  }, [usePortalOverlay, setFilterPortal, open, pickerSheet]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.ddTrigger,
          pressed && styles.ddTriggerPressed,
        ]}
      >
        <Text style={styles.ddTriggerTxt} numberOfLines={1}>
          {selected?.label ?? '—'}
        </Text>
        <SystemIcon name="chevronDown" size={14} color={palette.textMuted} />
      </Pressable>
      {open && !usePortalOverlay ? pickerSheet : null}
    </View>
  );
}
