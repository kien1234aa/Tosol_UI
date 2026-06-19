import { useCallback } from 'react';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { getDraftProductMaxQuantity } from '@/src/helpers/createOrder';
import {
  makeSelectDraftGroupViewModels,
  makeSelectDraftGrandTotal,
  makeSelectHasDraftProducts,
  removeDraftGroup,
  removeDraftProduct,
  setDraftGroupNote,
  toggleDraftGroupInsurance,
  toggleDraftGroupWoodPacking,
  updateDraftProductQuantity,
  updateDraftProductUnitPrice,
  updateDraftProductTaxRate,
} from '@/src/redux/createOrderDraft';
import type { DraftProductGroupViewModel } from '@/src/types/createOrderDraft/createOrderDraft.types';
import {
  useCreateOrderForm,
  type UseCreateOrderFormOptions,
} from './useCreateOrderForm';
import type { UseCreateOrderFormResult } from './useCreateOrderForm';
import { useMemo } from 'react';

export interface UseCreateOrderResult extends UseCreateOrderFormResult {
  draftId: string;
  groups: DraftProductGroupViewModel[];
  grandTotalVnd: number;
  hasProducts: boolean;
  onToggleInsurance: (groupId: string) => void;
  onToggleWoodPacking: (groupId: string) => void;
  onChangeGroupNote: (groupId: string, note: string) => void;
  onIncreaseQuantity: (groupId: string, productId: string) => void;
  onDecreaseQuantity: (groupId: string, productId: string) => void;
  onChangeQuantity: (groupId: string, productId: string, quantity: number) => void;
  onChangeUnitPrice: (
    groupId: string,
    productId: string,
    unitPriceVnd: number,
  ) => void;
  onChangeTaxRate: (
    groupId: string,
    productId: string,
    taxRatePercent: number,
  ) => void;
  onRemoveProduct: (groupId: string, productId: string) => void;
  onRemoveGroup: (groupId: string) => void;
}

export function useCreateOrder(
  draftId: string,
  options: UseCreateOrderFormOptions = {},
): UseCreateOrderResult {
  const dispatch = useAppDispatch();
  const selectGroupViewModels = useMemo(
    () => makeSelectDraftGroupViewModels(draftId),
    [draftId],
  );
  const selectGrandTotal = useMemo(
    () => makeSelectDraftGrandTotal(draftId),
    [draftId],
  );
  const selectHasProducts = useMemo(
    () => makeSelectHasDraftProducts(draftId),
    [draftId],
  );
  const groups = useAppSelector(selectGroupViewModels);
  const grandTotalVnd = useAppSelector(selectGrandTotal);
  const hasProducts = useAppSelector(selectHasProducts);
  const createOrderForm = useCreateOrderForm(draftId, options);

  const onToggleInsurance = useCallback(
    (groupId: string) => {
      dispatch(toggleDraftGroupInsurance({ draftId, groupId }));
    },
    [dispatch, draftId],
  );

  const onToggleWoodPacking = useCallback(
    (groupId: string) => {
      dispatch(toggleDraftGroupWoodPacking({ draftId, groupId }));
    },
    [dispatch, draftId],
  );

  const onChangeGroupNote = useCallback(
    (groupId: string, note: string) => {
      dispatch(setDraftGroupNote({ draftId, groupId, note }));
    },
    [dispatch, draftId],
  );

  const onIncreaseQuantity = useCallback(
    (groupId: string, productId: string) => {
      const group = groups.find(item => item.id === groupId);
      const product = group?.products.find(item => item.id === productId);
      if (!product) {
        return;
      }

      const maxQuantity = getDraftProductMaxQuantity(product);
      if (product.quantity >= maxQuantity) {
        return;
      }

      dispatch(
        updateDraftProductQuantity({
          draftId,
          groupId,
          productId,
          quantity: product.quantity + 1,
        }),
      );
    },
    [dispatch, draftId, groups],
  );

  const onDecreaseQuantity = useCallback(
    (groupId: string, productId: string) => {
      const group = groups.find(item => item.id === groupId);
      const product = group?.products.find(item => item.id === productId);
      if (!product) {
        return;
      }
      dispatch(
        updateDraftProductQuantity({
          draftId,
          groupId,
          productId,
          quantity: product.quantity - 1,
        }),
      );
    },
    [dispatch, draftId, groups],
  );

  const onChangeQuantity = useCallback(
    (groupId: string, productId: string, quantity: number) => {
      dispatch(
        updateDraftProductQuantity({
          draftId,
          groupId,
          productId,
          quantity,
        }),
      );
    },
    [dispatch, draftId],
  );

  const onChangeUnitPrice = useCallback(
    (groupId: string, productId: string, unitPriceVnd: number) => {
      dispatch(
        updateDraftProductUnitPrice({
          draftId,
          groupId,
          productId,
          unitPriceVnd,
        }),
      );
    },
    [dispatch, draftId],
  );

  const onChangeTaxRate = useCallback(
    (groupId: string, productId: string, taxRatePercent: number) => {
      dispatch(
        updateDraftProductTaxRate({
          draftId,
          groupId,
          productId,
          taxRatePercent,
        }),
      );
    },
    [dispatch, draftId],
  );

  const onRemoveProduct = useCallback(
    (groupId: string, productId: string) => {
      dispatch(removeDraftProduct({ draftId, groupId, productId }));
    },
    [dispatch, draftId],
  );

  const onRemoveGroup = useCallback(
    (groupId: string) => {
      dispatch(removeDraftGroup({ draftId, groupId }));
    },
    [dispatch, draftId],
  );

  return {
    draftId,
    groups,
    grandTotalVnd,
    hasProducts,
    onToggleInsurance,
    onToggleWoodPacking,
    onChangeGroupNote,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onChangeQuantity,
    onChangeUnitPrice,
    onChangeTaxRate,
    onRemoveProduct,
    onRemoveGroup,
    ...createOrderForm,
  };
}
