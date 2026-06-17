import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Calendar } from 'lucide-react-native';
import { orderAdvancedFilterCopy } from '@/src/configs/orders/orderFilters.constants';
import { lightTokens } from '@/src/configs/theme';
import {
  dateToIsoDateOnly,
  isoDateOnlyToDate,
  isoDateToDisplay,
} from '@/src/helpers/orders/orderFilters.helpers';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

const wheelItemHeight = 40;
const wheelVisibleRows = 5;
const wheelHeight = wheelItemHeight * wheelVisibleRows;
const wheelPaddingRows = Math.floor(wheelVisibleRows / 2);

interface OrderFilterDateFieldProps {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
}

function buildYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear - 5; year <= currentYear + 1; year += 1) {
    years.push(year);
  }
  return years;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface WheelColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function WheelColumn({ items, selectedIndex, onSelect }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * wheelItemHeight,
      animated: false,
    });
  }, [selectedIndex, items.length]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.min(
        items.length - 1,
        Math.max(0, Math.round(offsetY / wheelItemHeight)),
      );
      onSelect(index);
      scrollRef.current?.scrollTo({
        y: index * wheelItemHeight,
        animated: true,
      });
    },
    [items.length, onSelect],
  );

  return (
    <View style={styles.wheelColumn}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={wheelItemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.wheelContent}>
        {Array.from({ length: wheelPaddingRows }).map((_, index) => (
          <View key={`pad-top-${index}`} style={styles.wheelItem} />
        ))}
        {items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.wheelItem}>
            <Text
              size="sm"
              className={
                index === selectedIndex
                  ? 'font-semibold text-typography-900'
                  : 'text-typography-500'
              }>
              {item}
            </Text>
          </View>
        ))}
        {Array.from({ length: wheelPaddingRows }).map((_, index) => (
          <View key={`pad-bottom-${index}`} style={styles.wheelItem} />
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.wheelHighlight} />
    </View>
  );
}

function OrderFilterDateFieldComponent({
  label,
  value,
  onChange,
}: OrderFilterDateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const yearOptions = useMemo(() => buildYearOptions(), []);
  const initialDate = isoDateOnlyToDate(value) ?? new Date();

  const [dayIndex, setDayIndex] = useState(initialDate.getDate() - 1);
  const [monthIndex, setMonthIndex] = useState(initialDate.getMonth());
  const [yearIndex, setYearIndex] = useState(
    Math.max(0, yearOptions.indexOf(initialDate.getFullYear())),
  );

  const selectedYear = yearOptions[yearIndex] ?? new Date().getFullYear();
  const selectedMonth = monthIndex + 1;
  const dayCount = daysInMonth(selectedYear, selectedMonth);

  const dayOptions = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, index) =>
        String(index + 1).padStart(2, '0'),
      ),
    [dayCount],
  );

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        String(index + 1).padStart(2, '0'),
      ),
    [],
  );

  const yearOptionLabels = useMemo(
    () => yearOptions.map(year => String(year)),
    [yearOptions],
  );

  useEffect(() => {
    if (dayIndex >= dayCount) {
      setDayIndex(dayCount - 1);
    }
  }, [dayCount, dayIndex]);

  const displayValue = useMemo(
    () => (value ? isoDateToDisplay(value) : orderAdvancedFilterCopy.datePlaceholder),
    [value],
  );
  const isPlaceholder = !value;

  const openPicker = useCallback(() => {
    const date = isoDateOnlyToDate(value) ?? new Date();
    setDayIndex(date.getDate() - 1);
    setMonthIndex(date.getMonth());
    setYearIndex(Math.max(0, yearOptions.indexOf(date.getFullYear())));
    setIsOpen(true);
  }, [value, yearOptions]);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const applyDate = useCallback(() => {
    const date = new Date(
      selectedYear,
      monthIndex,
      Math.min(dayIndex + 1, dayCount),
    );
    onChange(dateToIsoDateOnly(date));
    setIsOpen(false);
  }, [dayCount, dayIndex, monthIndex, onChange, selectedYear]);

  return (
    <>
      <View style={styles.wrapper}>
        <Text size="xs" className="mb-1.5 text-typography-500">
          {label}
        </Text>
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          style={styles.field}>
          <Text
            size="sm"
            numberOfLines={1}
            className={
              isPlaceholder
                ? 'flex-1 text-typography-500'
                : 'flex-1 text-typography-900'
            }>
            {displayValue}
          </Text>
          <Calendar color={lightTokens.typography500} size={18} />
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePicker}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Pressable onPress={closePicker} accessibilityRole="button">
              <Text size="sm" className="font-medium text-typography-500">
                {orderAdvancedFilterCopy.cancel}
              </Text>
            </Pressable>
            <Text size="sm" className="font-semibold text-typography-900">
              {label}
            </Text>
            <Pressable onPress={applyDate} accessibilityRole="button">
              <Text size="sm" className="font-semibold text-tertiary-600">
                {orderAdvancedFilterCopy.apply}
              </Text>
            </Pressable>
          </View>

          <View style={styles.wheelsRow}>
            <WheelColumn
              items={dayOptions}
              selectedIndex={dayIndex}
              onSelect={setDayIndex}
            />
            <WheelColumn
              items={monthOptions}
              selectedIndex={monthIndex}
              onSelect={setMonthIndex}
            />
            <WheelColumn
              items={yearOptionLabels}
              selectedIndex={yearIndex}
              onSelect={setYearIndex}
            />
          </View>
        </View>
      </Modal>
    </>
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
  sheet: {
    flex: 1,
    backgroundColor: lightTokens.background0,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTokens.outline100,
  },
  wheelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  wheelColumn: {
    flex: 1,
    height: wheelHeight,
    position: 'relative',
  },
  wheelContent: {
    paddingVertical: 0,
  },
  wheelItem: {
    height: wheelItemHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelHighlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: wheelItemHeight * wheelPaddingRows,
    height: wheelItemHeight,
    borderRadius: 12,
    backgroundColor: lightTokens.background100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const OrderFilterDateField = memo(OrderFilterDateFieldComponent);
