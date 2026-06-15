import { useMemo } from 'react';
import { getOrderDetailById } from '@/src/helpers/orders';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectOrderById } from '@/src/redux/orders';
import type { OrderDetail } from '@/src/types/orders/orders.types';

export interface UseOrderDetailResult {
  order: OrderDetail | undefined;
  canPay: boolean;
  canCancel: boolean;
}

export function useOrderDetail(orderId: string): UseOrderDetailResult {
  const listItem = useAppSelector(state => selectOrderById(state, orderId));

  const order = useMemo(() => {
    const detail = getOrderDetailById(orderId);
    if (!detail) {
      return undefined;
    }

    if (!listItem) {
      return detail;
    }

    return {
      ...detail,
      status: listItem.status,
      paidVnd: listItem.paidVnd,
      totalCostVnd: listItem.totalCostVnd,
      costs: {
        ...detail.costs,
        paidVnd: listItem.paidVnd,
        totalVnd: listItem.totalCostVnd,
        remainingVnd: Math.max(listItem.totalCostVnd - listItem.paidVnd, 0),
      },
    };
  }, [listItem, orderId]);

  const canPay =
    order?.status === 'awaitingDeposit' || order?.status === 'awaitingPayment';
  const canCancel =
    order?.status === 'awaitingDeposit' ||
    order?.status === 'awaitingPayment' ||
    order?.status === 'processing';

  return {
    order,
    canPay: Boolean(canPay && order && order.costs.remainingVnd > 0),
    canCancel: Boolean(canCancel),
  };
}
