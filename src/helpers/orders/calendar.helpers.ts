import { dateToIsoDateOnly, isoDateOnlyToDate } from './orderFilters.helpers';

const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

const monthLabels = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
] as const;

export function formatCalendarMonthYear(year: number, monthIndex: number): string {
  return `${monthLabels[monthIndex]} ${year}`;
}

export function getMondayFirstWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function buildCalendarCells(
  year: number,
  monthIndex: number,
): Array<Date | null> {
  const firstDay = new Date(year, monthIndex, 1);
  const leadingEmpty = getMondayFirstWeekdayIndex(firstDay);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function isSameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isSameIsoDateOnly(isoDate: string, date: Date): boolean {
  const parsed = isoDateOnlyToDate(isoDate);
  return parsed ? isSameCalendarDay(parsed, date) : false;
}

export function isoDateFromCalendarDay(date: Date): string {
  return dateToIsoDateOnly(date);
}

export { weekdayLabels };
