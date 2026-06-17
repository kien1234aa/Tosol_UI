import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartState } from '@/src/redux/cart/cartSlice';
import type { CartGroup, CartProductItem } from '@/src/types/cart/cart.types';

const cartStorageKeyPrefix = '@tosol/cart/';

function getCartStorageKey(userId: string): string {
  return `${cartStorageKeyPrefix}${userId}`;
}

function isCartProductItem(value: unknown): value is CartProductItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CartProductItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.variant === 'string' &&
    typeof item.priceCny === 'number' &&
    typeof item.priceVnd === 'number' &&
    typeof item.quantity === 'number' &&
    typeof item.selected === 'boolean'
  );
}

function isCartGroup(value: unknown): value is CartGroup {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const group = value as Partial<CartGroup>;

  return (
    typeof group.id === 'string' &&
    typeof group.supplierName === 'string' &&
    typeof group.insurance === 'boolean' &&
    typeof group.woodPacking === 'boolean' &&
    typeof group.note === 'string' &&
    typeof group.selected === 'boolean' &&
    Array.isArray(group.products) &&
    group.products.every(isCartProductItem)
  );
}

function isCartState(value: unknown): value is CartState {
  return (
    value != null &&
    typeof value === 'object' &&
    Array.isArray((value as CartState).groups) &&
    (value as CartState).groups.every(isCartGroup)
  );
}

export const cartStorage = {
  async save(userId: string, cart: CartState): Promise<void> {
    await AsyncStorage.setItem(getCartStorageKey(userId), JSON.stringify(cart));
  },

  async load(userId: string): Promise<CartState | null> {
    const raw = await AsyncStorage.getItem(getCartStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isCartState(parsed)) {
        await AsyncStorage.removeItem(getCartStorageKey(userId));
        return null;
      }

      return parsed;
    } catch {
      await AsyncStorage.removeItem(getCartStorageKey(userId));
      return null;
    }
  },

  async clear(userId: string): Promise<void> {
    await AsyncStorage.removeItem(getCartStorageKey(userId));
  },
};
