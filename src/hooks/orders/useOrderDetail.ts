import { useCallback, useEffect, useState } from 'react';
import { saleOrdersService } from '@/src/apis/orders/saleOrders.api';
import { orderDetailCopy } from '@/src/configs/orders';
import { mapSaleOrderDetailToOrderDetail, canCancelSaleOrder } from '@/src/helpers/orders/saleOrder.helpers';
import type { OrderDetail } from '@/src/types/orders/orders.types';

export interface UseOrderDetailResult {
  order: OrderDetail | undefined;
  isLoading: boolean;
  error: string | null;
  canCancel: boolean;
  reload: () => void;
}

export function useOrderDetail(orderId: string): UseOrderDetailResult {
  const [order, setOrder] = useState<OrderDetail | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await saleOrdersService.getDetail(orderId);
      setOrder(mapSaleOrderDetailToOrderDetail(data));
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : orderDetailCopy.loadError;
      setError(message);
      setOrder(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const canCancel = order != null && canCancelSaleOrder(order.status);

  return {
    order,
    isLoading,
    error,
    canCancel,
    reload: loadOrder,
  };
}
