import { useState } from 'react';
import { mockDeliveredOrderItems } from '@/src/configs/orders';
import type { DeliveredOrderItem } from '@/src/types/orders/deliveredOrders.types';

export interface UseDeliveredOrdersResult {
  items: DeliveredOrderItem[];
}

export function useDeliveredOrders(): UseDeliveredOrdersResult {
  const [items] = useState<DeliveredOrderItem[]>(mockDeliveredOrderItems);
  return { items };
}
