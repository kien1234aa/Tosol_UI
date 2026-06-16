import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectConsignmentById } from '@/src/redux/consignment';
import type { ConsignmentOrderItem } from '@/src/types/consignment/consignment.types';

export interface UseConsignmentDetailResult {
  order: ConsignmentOrderItem | undefined;
}

export function useConsignmentDetail(
  orderId: string,
): UseConsignmentDetailResult {
  const order = useAppSelector(state =>
    selectConsignmentById(state, orderId),
  );

  return { order };
}
