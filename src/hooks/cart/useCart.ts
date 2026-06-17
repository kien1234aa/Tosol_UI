import { useCallback } from 'react';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { getCartProductMaxQuantity } from '@/src/helpers/cart';
import {
  removeCartGroup,
  removeCartProduct,
  selectCartGrandTotal,
  selectCartGroupViewModels,
  selectHasSelectedCartItems,
  selectIsAllCartSelected,
  setCartGroupNote,
  toggleCartGroupInsurance,
  toggleCartGroupSelected,
  toggleCartGroupWoodPacking,
  toggleCartProductSelected,
  toggleSelectAllCart,
  updateCartProductQuantity,
} from '@/src/redux/cart';
import type { CartGroupViewModel } from '@/src/types/cart/cart.types';
import { useCreateOrderForm } from './useCreateOrderForm';
import type { UseCreateOrderFormResult } from './useCreateOrderForm';

export interface UseCartResult extends UseCreateOrderFormResult {
  groups: CartGroupViewModel[];
  grandTotalVnd: number;
  isAllSelected: boolean;
  hasSelectedItems: boolean;
  onToggleSelectAll: () => void;
  onToggleGroup: (groupId: string) => void;
  onToggleProduct: (groupId: string, productId: string) => void;
  onToggleInsurance: (groupId: string) => void;
  onToggleWoodPacking: (groupId: string) => void;
  onChangeGroupNote: (groupId: string, note: string) => void;
  onIncreaseQuantity: (groupId: string, productId: string) => void;
  onDecreaseQuantity: (groupId: string, productId: string) => void;
  onRemoveProduct: (groupId: string, productId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onCreateOrders: () => void;
  onCreateGroupOrder: (groupId: string) => void;
}

export function useCart(): UseCartResult {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectCartGroupViewModels);
  const grandTotalVnd = useAppSelector(selectCartGrandTotal);
  const isAllSelected = useAppSelector(selectIsAllCartSelected);
  const hasSelectedItems = useAppSelector(selectHasSelectedCartItems);
  const createOrderForm = useCreateOrderForm();

  const onToggleSelectAll = useCallback(() => {
    dispatch(toggleSelectAllCart(!isAllSelected));
  }, [dispatch, isAllSelected]);

  const onToggleGroup = useCallback(
    (groupId: string) => {
      dispatch(toggleCartGroupSelected(groupId));
    },
    [dispatch],
  );

  const onToggleProduct = useCallback(
    (groupId: string, productId: string) => {
      dispatch(toggleCartProductSelected({ groupId, productId }));
    },
    [dispatch],
  );

  const onToggleInsurance = useCallback(
    (groupId: string) => {
      dispatch(toggleCartGroupInsurance(groupId));
    },
    [dispatch],
  );

  const onToggleWoodPacking = useCallback(
    (groupId: string) => {
      dispatch(toggleCartGroupWoodPacking(groupId));
    },
    [dispatch],
  );

  const onChangeGroupNote = useCallback(
    (groupId: string, note: string) => {
      dispatch(setCartGroupNote({ groupId, note }));
    },
    [dispatch],
  );

  const onIncreaseQuantity = useCallback(
    (groupId: string, productId: string) => {
      const group = groups.find(item => item.id === groupId);
      const product = group?.products.find(item => item.id === productId);
      if (!product) {
        return;
      }

      const maxQuantity = getCartProductMaxQuantity(product);
      if (product.quantity >= maxQuantity) {
        return;
      }

      dispatch(
        updateCartProductQuantity({
          groupId,
          productId,
          quantity: product.quantity + 1,
        }),
      );
    },
    [dispatch, groups],
  );

  const onDecreaseQuantity = useCallback(
    (groupId: string, productId: string) => {
      const group = groups.find(item => item.id === groupId);
      const product = group?.products.find(item => item.id === productId);
      if (!product) {
        return;
      }
      dispatch(
        updateCartProductQuantity({
          groupId,
          productId,
          quantity: product.quantity - 1,
        }),
      );
    },
    [dispatch, groups],
  );

  const onRemoveProduct = useCallback(
    (groupId: string, productId: string) => {
      dispatch(removeCartProduct({ groupId, productId }));
    },
    [dispatch],
  );

  const onRemoveGroup = useCallback(
    (groupId: string) => {
      dispatch(removeCartGroup(groupId));
    },
    [dispatch],
  );

  const onCreateOrders = useCallback(() => {
    createOrderForm.openCreateOrder();
  }, [createOrderForm]);

  const onCreateGroupOrder = useCallback(
    (groupId: string) => {
      createOrderForm.openCreateOrder({ groupId });
    },
    [createOrderForm],
  );

  return {
    groups,
    grandTotalVnd,
    isAllSelected,
    hasSelectedItems,
    onToggleSelectAll,
    onToggleGroup,
    onToggleProduct,
    onToggleInsurance,
    onToggleWoodPacking,
    onChangeGroupNote,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveProduct,
    onRemoveGroup,
    onCreateOrders,
    onCreateGroupOrder,
    ...createOrderForm,
  };
}
