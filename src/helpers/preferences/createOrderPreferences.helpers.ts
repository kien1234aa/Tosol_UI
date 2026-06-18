import {
  buildShopContextKey,
  buildShippingMethodContextKey,
  buildWarehouseContextKey,
  preferenceKeys,
} from '@/src/configs/preferences/preferences.constants';
import { createOrderShippingMethods } from '@/src/configs/cart/createOrder.constants';
import { customerSearchResultToPreferenceMeta } from '@/src/helpers/preferences/preferences.helpers';
import type {
  CreateOrderFormState,
  CreateOrderSelectOption,
  CustomerSearchResult,
} from '@/src/types/orders/createOrder.types';
import type { RecordPreferencePayload } from '@/src/types/preferences/preferences.types';

interface BuildCreateOrderPreferenceRecordsInput {
  form: CreateOrderFormState;
  shopLabel: string;
  warehouseLabel: string;
  shippingPartnerLabel: string;
  customer: CustomerSearchResult | null;
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
  boost?: number;
}

export function buildCreateOrderPreferenceRecords(
  input: BuildCreateOrderPreferenceRecordsInput,
): RecordPreferencePayload[] {
  const {
    form,
    shopLabel,
    warehouseLabel,
    shippingPartnerLabel,
    customer,
    provinceLabel,
    districtLabel,
    wardLabel,
    boost = 2,
  } = input;

  const records: RecordPreferencePayload[] = [];

  if (form.shopId != null) {
    records.push({
      key: preferenceKeys.shop,
      id: form.shopId,
      label: shopLabel,
      boost,
    });
  }

  if (form.packagingWarehouseId != null) {
    records.push({
      key: preferenceKeys.packagingWarehouse,
      id: form.packagingWarehouseId,
      label: warehouseLabel,
      boost,
    });

    if (form.shopId != null) {
      records.push({
        key: preferenceKeys.packagingWarehouse,
        id: form.packagingWarehouseId,
        label: warehouseLabel,
        contextKey: buildShopContextKey(form.shopId),
        boost,
      });
    }
  }

  if (customer) {
    records.push({
      key: preferenceKeys.customer,
      id: customer.id,
      label: customer.name,
      subtitle: customer.phone,
      meta: customerSearchResultToPreferenceMeta(customer),
      boost,
    });
  }

  records.push({
    key: preferenceKeys.shippingMethod,
    id: form.shippingMethod,
    label:
      createOrderShippingMethods.find(item => item.value === form.shippingMethod)
        ?.label ?? form.shippingMethod,
    boost,
  });

  if (form.warehousePartnerId != null && form.shippingMethod !== 'customer_pickup') {
    records.push({
      key: preferenceKeys.shippingPartner,
      id: form.warehousePartnerId,
      label: shippingPartnerLabel,
      contextKey: buildShippingMethodContextKey(form.shippingMethod),
      boost,
    });

    if (form.packagingWarehouseId != null) {
      records.push({
        key: preferenceKeys.shippingPartner,
        id: form.warehousePartnerId,
        label: shippingPartnerLabel,
        contextKey: buildWarehouseContextKey(form.packagingWarehouseId),
        boost,
      });
    }
  }

  if (form.provinceId != null && provinceLabel) {
    records.push({
      key: `${preferenceKeys.packagingWarehouse}.province`,
      id: form.provinceId,
      label: provinceLabel,
      boost,
    });
  }

  if (form.districtId != null && districtLabel) {
    records.push({
      key: `${preferenceKeys.packagingWarehouse}.district`,
      id: form.districtId,
      label: districtLabel,
      boost,
    });
  }

  if (form.wardId != null && wardLabel) {
    records.push({
      key: `${preferenceKeys.packagingWarehouse}.ward`,
      id: form.wardId,
      label: wardLabel,
      boost,
    });
  }

  return records;
}

export function findSelectOptionById(
  options: CreateOrderSelectOption[],
  selectedId: number | null,
): CreateOrderSelectOption | null {
  if (selectedId == null) {
    return null;
  }

  return options.find(option => option.id === selectedId) ?? null;
}
