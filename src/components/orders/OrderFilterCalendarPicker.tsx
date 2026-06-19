import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable as RNPressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import {
  buildCalendarCells,
  formatCalendarMonthYear,
  isSameCalendarDay,
  isSameIsoDateOnly,
  weekdayLabels,
} from '@/src/helpers/orders/calendar.helpers';
import { isoDateOnlyToDate } from '@/src/helpers/orders/orderFilters.helpers';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface OrderFilterCalendarPickerProps {
  value: string;
  onChange: (date: Date) => void;
}

function OrderFilterCalendarPickerComponent({
  value,
  onChange,
}: OrderFilterCalendarPickerProps) {
  const selectedDate = isoDateOnlyToDate(value) ?? new Date();
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [visibleYear, setVisibleYear] = useState(selectedDate.getFullYear());
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(
    selectedDate.getMonth(),
  );

  useEffect(() => {
    const date = isoDateOnlyToDate(value) ?? new Date();
    setVisibleYear(date.getFullYear());
    setVisibleMonthIndex(date.getMonth());
  }, [value]);

  const cells = useMemo(
    () => buildCalendarCells(visibleYear, visibleMonthIndex),
    [visibleMonthIndex, visibleYear],
  );

  const weeks = useMemo(() => {
    const rows: Array<Array<Date | null>> = [];
    for (let index = 0; index < cells.length; index += 7) {
      rows.push(cells.slice(index, index + 7));
    }
    return rows;
  }, [cells]);

  const goToPreviousMonth = useCallback(() => {
    setVisibleMonthIndex(current => {
      if (current === 0) {
        setVisibleYear(year => year - 1);
        return 11;
      }
      return current - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setVisibleMonthIndex(current => {
      if (current === 11) {
        setVisibleYear(year => year + 1);
        return 0;
      }
      return current + 1;
    });
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.monthHeader}>
        <Pressable
          onPress={goToPreviousMonth}
          accessibilityRole="button"
          accessibilityLabel="Tháng trước"
          style={styles.navButton}>
          <ChevronLeft color={lightTokens.typography700} size={20} />
        </Pressable>

        <Text size="sm" className="font-semibold text-typography-900">
          {formatCalendarMonthYear(visibleYear, visibleMonthIndex)}
        </Text>

        <Pressable
          onPress={goToNextMonth}
          accessibilityRole="button"
          accessibilityLabel="Tháng sau"
          style={styles.navButton}>
          <ChevronRight color={lightTokens.typography700} size={20} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map(label => (
          <View key={label} style={styles.weekdayCell}>
            <Text size="xs" className="font-medium text-typography-500">
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((date, dayIndex) => {
              if (!date) {
                return (
                  <View
                    key={`empty-${weekIndex}-${dayIndex}`}
                    style={styles.dayCell}
                  />
                );
              }

              const isSelected = value
                ? isSameIsoDateOnly(value, date)
                : isSameCalendarDay(selectedDate, date);
              const isToday = isSameCalendarDay(date, today);

              return (
                <RNPressable
                  key={dateToKey(date)}
                  onPress={() => onChange(date)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}>
                  <Text
                    size="sm"
                    className={
                      isSelected
                        ? 'font-semibold text-typography-0'
                        : 'text-typography-900'
                    }>
                    {date.getDate()}
                  </Text>
                </RNPressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background100,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  grid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: lightTokens.tertiary500,
  },
  dayCellToday: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary500,
  },
});

export const OrderFilterCalendarPicker = memo(OrderFilterCalendarPickerComponent);
