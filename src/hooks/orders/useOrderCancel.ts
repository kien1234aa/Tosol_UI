import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { saleOrdersService } from '@/src/apis/orders/saleOrders.api';
import { ordersCopy } from '@/src/configs/orders';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { fetchCountersThunk } from '@/src/redux/counters';

export interface UseOrderCancelOptions {
  onSuccess?: () => void;
}

export interface UseOrderCancelResult {
  isVisible: boolean;
  orderNumber: string | null;
  reason: string;
  isSubmitting: boolean;
  error: string | null;
  openCancel: (orderNumber: string) => void;
  closeCancel: () => void;
  onChangeReason: (value: string) => void;
  confirmCancel: () => Promise<void>;
}

export function useOrderCancel(
  options: UseOrderCancelOptions = {},
): UseOrderCancelResult {
  const dispatch = useAppDispatch();
  const { onSuccess } = options;
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCancel = useCallback((nextOrderNumber: string) => {
    setOrderNumber(nextOrderNumber);
    setReason('');
    setError(null);
    setIsSubmitting(false);
  }, []);

  const closeCancel = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setOrderNumber(null);
    setReason('');
    setError(null);
  }, [isSubmitting]);

  const onChangeReason = useCallback((value: string) => {
    setReason(value);
    setError(null);
  }, []);

  const confirmCancel = useCallback(async () => {
    const trimmedReason = reason.trim();

    if (!orderNumber) {
      return;
    }

    if (!trimmedReason) {
      setError(ordersCopy.cancelReasonRequired);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await saleOrdersService.cancel(orderNumber, trimmedReason);
      setOrderNumber(null);
      setReason('');
      onSuccess?.();
      void dispatch(fetchCountersThunk({ force: true }));
      Alert.alert(ordersCopy.cancelSuccess);
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : ordersCopy.loadError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, onSuccess, orderNumber, reason]);

  return {
    isVisible: orderNumber != null,
    orderNumber,
    reason,
    isSubmitting,
    error,
    openCancel,
    closeCancel,
    onChangeReason,
    confirmCancel,
  };
}
