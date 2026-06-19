import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable as RNPressable,
  StyleSheet,
  View,
} from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { orderAdvancedFilterCopy } from '@/src/configs/orders/orderFilters.constants';
import { buttonContentCenter, buttonLabelStyle, lightTokens } from '@/src/configs/theme';
import {
  dateToIsoDateOnly,
  isoDateToDisplay,
} from '@/src/helpers/orders/orderFilters.helpers';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { OrderFilterCalendarPicker } from './OrderFilterCalendarPicker';

export interface OrderFilterDateFieldProps {
  label: string;
  value: string;
  onPress: () => void;
}

export interface OrderFilterDatePickerSheetProps {
  label: string;
  value: string;
  onApply: (isoDate: string) => void;
  onClose: () => void;
}

function OrderFilterDateFieldComponent({
  label,
  value,
  onPress,
}: OrderFilterDateFieldProps) {
  const displayValue = useMemo(
    () =>
      value ? isoDateToDisplay(value) : orderAdvancedFilterCopy.datePlaceholder,
    [value],
  );
  const isPlaceholder = !value;

  return (
    <View style={styles.wrapper}>
      <Text size="xs" className="mb-1.5 text-typography-500">
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayValue}`}
        style={styles.field}>
        <Calendar color={lightTokens.typography500} size={18} />
        <Text
          size="sm"
          numberOfLines={1}
          className={
            isPlaceholder
              ? 'flex-1 text-typography-400'
              : 'flex-1 text-typography-900'
          }>
          {displayValue}
        </Text>
        <ChevronDown color={lightTokens.typography500} size={18} />
      </Pressable>
    </View>
  );
}

function OrderFilterDatePickerSheetComponent({
  label,
  value,
  onApply,
  onClose,
}: OrderFilterDatePickerSheetProps) {
  const [selectedIso, setSelectedIso] = useState(
    () => value || dateToIsoDateOnly(new Date()),
  );

  useEffect(() => {
    setSelectedIso(value || dateToIsoDateOnly(new Date()));
  }, [label, value]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedIso(dateToIsoDateOnly(date));
  }, []);

  const applyDate = useCallback(() => {
    onApply(selectedIso);
  }, [onApply, selectedIso]);

  const clearDate = useCallback(() => {
    onApply('');
    onClose();
  }, [onApply, onClose]);

  const previewLabel = useMemo(
    () =>
      selectedIso
        ? isoDateToDisplay(selectedIso)
        : orderAdvancedFilterCopy.datePlaceholder,
    [selectedIso],
  );

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <RNPressable style={styles.overlay} onPress={onClose}>
        <RNPressable style={styles.sheet} onPress={() => {}}>
          <Text size="md" className="mb-1 font-semibold text-typography-900">
            {label}
          </Text>
          <Text size="xs" className="mb-4 text-typography-500">
            {orderAdvancedFilterCopy.selectedDateLabel}: {previewLabel}
          </Text>

          <OrderFilterCalendarPicker
            value={selectedIso}
            onChange={handleSelectDate}
          />

          <RNPressable
            onPress={applyDate}
            accessibilityRole="button"
            style={[styles.confirmButton, buttonContentCenter]}>
            <Text
              size="sm"
              className="font-semibold text-typography-0"
              style={buttonLabelStyle}>
              {orderAdvancedFilterCopy.selectDate}
            </Text>
          </RNPressable>

          {value ? (
            <Pressable
              onPress={clearDate}
              accessibilityRole="button"
              style={styles.clearButton}>
              <Text size="sm" className="font-medium text-error-500">
                {orderAdvancedFilterCopy.clearDate}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={styles.clearButton}>
              <Text size="sm" className="font-medium text-typography-500">
                {orderAdvancedFilterCopy.cancel}
              </Text>
            </Pressable>
          )}
        </RNPressable>
      </RNPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
  },
  field: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  confirmButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary500,
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export const OrderFilterDateField = memo(OrderFilterDateFieldComponent);
export const OrderFilterDatePickerSheet = memo(OrderFilterDatePickerSheetComponent);
