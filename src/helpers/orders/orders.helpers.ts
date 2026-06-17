import type { OrderDetail } from '@/src/types/orders/orders.types';

export function formatOrderDate(isoDate: string): string {
  const datePart = isoDate.slice(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}/${month}/${year}`;
}

export function formatOrderPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

export function formatOrderLabel(
  labels: Record<string, string>,
  value: string,
): string {
  return labels[value] ?? value;
}

export function formatYesNo(value: boolean): string {
  return value ? 'Có' : 'Không';
}

export function shouldShowCostRow(amountVnd: number): boolean {
  return amountVnd > 0;
}

export type { OrderDetail };
