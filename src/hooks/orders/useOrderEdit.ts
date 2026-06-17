import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { saleOrdersService } from '@/src/apis/orders/saleOrders.api';
import { ordersCopy } from '@/src/configs/orders';

export interface UseOrderEditOptions {
  onSuccess?: () => void;
}

export interface UseOrderEditResult {
  isVisible: boolean;
  orderNumber: string | null;
  note: string;
  isSubmitting: boolean;
  error: string | null;
  openEdit: (orderNumber: string, initialNote?: string) => void;
  closeEdit: () => void;
  onChangeNote: (value: string) => void;
  confirmEdit: () => Promise<void>;
}

export function useOrderEdit(
  options: UseOrderEditOptions = {},
): UseOrderEditResult {
  const { onSuccess } = options;
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEdit = useCallback((nextOrderNumber: string, initialNote = '') => {
    setOrderNumber(nextOrderNumber);
    setNote(initialNote);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const closeEdit = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setOrderNumber(null);
    setNote('');
    setError(null);
  }, [isSubmitting]);

  const onChangeNote = useCallback((value: string) => {
    setNote(value);
    setError(null);
  }, []);

  const confirmEdit = useCallback(async () => {
    if (!orderNumber) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await saleOrdersService.update(orderNumber, {
        note: note.trim(),
      });
      setOrderNumber(null);
      setNote('');
      onSuccess?.();
      Alert.alert(ordersCopy.editSuccess);
    } catch (editError) {
      setError(
        editError instanceof Error ? editError.message : ordersCopy.loadError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [note, onSuccess, orderNumber]);

  return {
    isVisible: orderNumber != null,
    orderNumber,
    note,
    isSubmitting,
    error,
    openEdit,
    closeEdit,
    onChangeNote,
    confirmEdit,
  };
}
