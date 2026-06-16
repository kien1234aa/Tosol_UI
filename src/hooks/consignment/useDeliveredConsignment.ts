import { useState } from 'react';
import { mockDeliveredConsignmentItems } from '@/src/configs/consignment';
import type { DeliveredConsignmentItem } from '@/src/types/consignment/deliveredConsignment.types';

export interface UseDeliveredConsignmentResult {
  items: DeliveredConsignmentItem[];
}

export function useDeliveredConsignment(): UseDeliveredConsignmentResult {
  const [items] = useState<DeliveredConsignmentItem[]>(
    mockDeliveredConsignmentItems,
  );
  return { items };
}
