import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultCreateOrderFormState } from '@/src/configs/createOrder/createOrder.constants';
import { createDraftOrderId } from '@/src/helpers/createOrder/draft.helpers';
import type { CreateOrderDraftState } from '@/src/redux/createOrderDraft/createOrderDraftSlice';
import type {
  DraftOrder,
  DraftProductGroup,
  DraftProductItem,
} from '@/src/types/createOrderDraft/createOrderDraft.types';
import type { CreateOrderFormState } from '@/src/types/orders/createOrder.types';

const draftStorageKeyPrefix = '@tosol/create-order-draft/';

function getDraftStorageKey(userId: string): string {
  return `${draftStorageKeyPrefix}${userId}`;
}

function isDraftProductItem(value: unknown): value is DraftProductItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<DraftProductItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.variant === 'string' &&
    typeof item.priceCny === 'number' &&
    typeof item.priceVnd === 'number' &&
    typeof item.quantity === 'number' &&
    (item.isCustomPricing == null || typeof item.isCustomPricing === 'boolean') &&
    (item.isPriceOverridden == null || typeof item.isPriceOverridden === 'boolean') &&
    (item.taxRatePercent == null || typeof item.taxRatePercent === 'number')
  );
}

function isDraftProductGroup(value: unknown): value is DraftProductGroup {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const group = value as Partial<DraftProductGroup>;

  return (
    typeof group.id === 'string' &&
    typeof group.supplierName === 'string' &&
    typeof group.insurance === 'boolean' &&
    typeof group.woodPacking === 'boolean' &&
    typeof group.note === 'string' &&
    Array.isArray(group.products) &&
    group.products.every(isDraftProductItem)
  );
}

function isCreateOrderFormState(value: unknown): value is CreateOrderFormState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const form = value as Partial<CreateOrderFormState>;

  return (
    (form.shopId == null || typeof form.shopId === 'number') &&
    (form.packagingWarehouseId == null ||
      typeof form.packagingWarehouseId === 'number') &&
    (form.customerId == null || typeof form.customerId === 'number') &&
    typeof form.shippingMethod === 'string' &&
  (form.warehousePartnerId == null || typeof form.warehousePartnerId === 'number') &&
    typeof form.recipientName === 'string' &&
    typeof form.recipientPhone === 'string' &&
    typeof form.recipientAddress === 'string' &&
    (form.provinceId == null || typeof form.provinceId === 'number') &&
    (form.districtId == null || typeof form.districtId === 'number') &&
    (form.wardId == null || typeof form.wardId === 'number') &&
    typeof form.isCodEnabled === 'boolean' &&
    typeof form.isAdvancedOpen === 'boolean' &&
    (form.orderDate == null || typeof form.orderDate === 'string') &&
    (form.shippingWarehouseId == null ||
      typeof form.shippingWarehouseId === 'number') &&
    (form.discountPercent == null || typeof form.discountPercent === 'string') &&
    (form.note == null || typeof form.note === 'string')
  );
}

function isDraftOrder(value: unknown): value is DraftOrder {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const draft = value as Partial<DraftOrder>;

  return (
    typeof draft.id === 'string' &&
    typeof draft.createdAt === 'string' &&
    typeof draft.updatedAt === 'string' &&
    Array.isArray(draft.groups) &&
    draft.groups.every(isDraftProductGroup) &&
    isCreateOrderFormState(draft.form)
  );
}

function isDraftState(value: unknown): value is CreateOrderDraftState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as Partial<CreateOrderDraftState>;

  if (!Array.isArray(state.drafts) || !state.drafts.every(isDraftOrder)) {
    return false;
  }

  return (
    state.activeDraftId == null || typeof state.activeDraftId === 'string'
  );
}

interface LegacyDraftState {
  groups: DraftProductGroup[];
}

function isLegacyDraftState(value: unknown): value is LegacyDraftState {
  return (
    value != null &&
    typeof value === 'object' &&
    Array.isArray((value as LegacyDraftState).groups) &&
    (value as LegacyDraftState).groups.every(isDraftProductGroup)
  );
}

function migrateLegacyDraftState(groups: DraftProductGroup[]): CreateOrderDraftState {
  const hasProducts = groups.some(group => group.products.length > 0);

  if (!hasProducts) {
    return { drafts: [], activeDraftId: null };
  }

  const now = new Date().toISOString();
  const draft: DraftOrder = {
    id: createDraftOrderId(),
    createdAt: now,
    updatedAt: now,
    groups,
    form: defaultCreateOrderFormState,
  };

  return {
    drafts: [draft],
    activeDraftId: draft.id,
  };
}

function normalizeDraftState(value: unknown): CreateOrderDraftState | null {
  if (isDraftState(value)) {
    return value;
  }

  if (isLegacyDraftState(value)) {
    return migrateLegacyDraftState(value.groups);
  }

  return null;
}

export const createOrderDraftStorage = {
  async save(userId: string, draft: CreateOrderDraftState): Promise<void> {
    await AsyncStorage.setItem(
      getDraftStorageKey(userId),
      JSON.stringify(draft),
    );
  },

  async load(userId: string): Promise<CreateOrderDraftState | null> {
    const raw = await AsyncStorage.getItem(getDraftStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      const normalized = normalizeDraftState(parsed);

      if (!normalized) {
        await AsyncStorage.removeItem(getDraftStorageKey(userId));
        return null;
      }

      return normalized;
    } catch {
      await AsyncStorage.removeItem(getDraftStorageKey(userId));
      return null;
    }
  },

  async clear(userId: string): Promise<void> {
    await AsyncStorage.removeItem(getDraftStorageKey(userId));
  },
};
