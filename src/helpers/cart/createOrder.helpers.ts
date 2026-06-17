import { createOrderCopy } from '@/src/configs/cart/createOrder.constants';
import { isAllWarehouses } from '@/src/configs/warehouse';
import type { CartGroup } from '@/src/types/cart/cart.types';
import type {
  CreateOrderFormState,
  CreateOrderModalContext,
  CreateOrderSelectOption,
  CustomerSearchResult,
  SellerWarehouseApiItem,
  ShopApiItem,
} from '@/src/types/orders/createOrder.types';
import type {
  CreateSaleOrderPayload,
  CreateSaleOrderItemPayload,
} from '@/src/types/orders/saleOrder.types';
import type {
  SellerShippingPartnerApiItem,
  ShippingRateEstimateItem,
} from '@/src/types/orders/shippingEstimate.types';

function getTargetCartGroups(
  groups: CartGroup[],
  context: CreateOrderModalContext | null,
): CartGroup[] {
  return context?.groupId
    ? groups.filter(group => group.id === context.groupId)
    : groups;
}

function toOrderDateYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Prefer warehouse selected on the search screen; fall back to form selection. */
export function resolveCreateOrderWarehouseId(
  currentWarehouseId: number | null | undefined,
  fallbackWarehouseId: number | null = null,
): number | null {
  if (!isAllWarehouses(currentWarehouseId) && currentWarehouseId != null) {
    return currentWarehouseId;
  }

  return fallbackWarehouseId;
}

export function getWarehouseCodeFromRecords(
  warehouses: SellerWarehouseApiItem[],
  warehouseId: number | null,
): string | null {
  if (warehouseId == null) {
    return null;
  }

  const code = warehouses.find(item => item.id === warehouseId)?.code?.trim();
  return code || null;
}

export function buildCreateOrderItems(
  groups: CartGroup[],
  context: CreateOrderModalContext | null,
): CreateSaleOrderItemPayload[] {
  const items: CreateSaleOrderItemPayload[] = [];

  for (const group of getTargetCartGroups(groups, context)) {
    if (!group.selected) {
      continue;
    }

    for (const product of group.products) {
      if (!product.selected) {
        continue;
      }

      const productId = Number(product.id);
      if (!Number.isFinite(productId) || productId <= 0) {
        continue;
      }

      items.push({
        product_id: productId,
        quantity: product.quantity,
        unit_price: product.priceVnd,
        discount_percent: 0,
        tax_rate: 0,
      });
    }
  }

  return items;
}

export interface BuildCreateOrderPayloadInput {
  form: CreateOrderFormState;
  shop: ShopApiItem;
  warehouseId: number;
  packingWarehouse: SellerWarehouseApiItem;
  groups: CartGroup[];
  context: CreateOrderModalContext | null;
  shippingPartnerOptions: CreateOrderSelectOption[];
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
  shippingFeeVnd: number;
}

export function buildCreateOrderPayload(
  input: BuildCreateOrderPayloadInput,
): CreateSaleOrderPayload {
  const {
    form,
    shop,
    warehouseId,
    packingWarehouse,
    groups,
    context,
    shippingPartnerOptions,
    provinceLabel,
    districtLabel,
    wardLabel,
    shippingFeeVnd,
  } = input;

  const items = buildCreateOrderItems(groups, context);
  const shippingPartnerSellerId = getEstimatePartnerId(
    shippingPartnerOptions,
    form.warehousePartnerId,
  );

  let shipment: CreateSaleOrderPayload['shipment'];

  if (form.shippingMethod === 'customer_pickup') {
    shipment = {
      recipient_name: form.recipientName.trim() || 'Khách',
      recipient_phone: form.recipientPhone.trim(),
      recipient_address: packingWarehouse.address.trim() || 'Lấy tại kho',
      recipient_province: (packingWarehouse.province ?? '').trim(),
      recipient_district: (packingWarehouse.district ?? '').trim(),
      recipient_ward: (packingWarehouse.ward ?? '').trim(),
      shipping_payer: 'buyer',
    };
  } else {
    shipment = {
      recipient_name: form.recipientName.trim(),
      recipient_phone: form.recipientPhone.trim(),
      recipient_address: form.recipientAddress.trim(),
      recipient_province: provinceLabel.trim(),
      recipient_district: districtLabel.trim(),
      recipient_ward: wardLabel.trim(),
      shipping_payer: 'buyer',
      shipping_partner_seller_id: shippingPartnerSellerId ?? undefined,
    };
  }

  return {
    shop_id: form.shopId as number,
    warehouse_id: warehouseId,
    shipping_warehouse_id: warehouseId,
    customer_id: form.customerId as number,
    currency_id: shop.currency_id,
    discount_amount: 0,
    collect_cod: form.isCodEnabled,
    order_date: toOrderDateYmd(new Date()),
    items,
    shipment,
    shipping_fee:
      form.shippingMethod === 'customer_pickup' ? 0 : Math.max(0, shippingFeeVnd),
  };
}

export function isCreateOrderLocationComplete(
  form: CreateOrderFormState,
  provinceLabel: string,
  districtLabel: string,
  wardLabel: string,
): boolean {
  if (form.shippingMethod === 'customer_pickup') {
    return true;
  }

  return (
    form.provinceId != null &&
    form.districtId != null &&
    form.wardId != null &&
    provinceLabel !== createOrderCopy.selectProvince &&
    districtLabel !== createOrderCopy.selectDistrict &&
    wardLabel !== createOrderCopy.selectWard
  );
}

export function getOrderedCartProductKeys(
  groups: CartGroup[],
  context: CreateOrderModalContext | null,
): { groupId: string; productId: string }[] {
  const keys: { groupId: string; productId: string }[] = [];

  for (const group of getTargetCartGroups(groups, context)) {
    for (const product of group.products) {
      if (product.selected) {
        keys.push({ groupId: group.id, productId: product.id });
      }
    }
  }

  return keys;
}

export function buildEstimateCartItems(
  groups: CartGroup[],
  context: CreateOrderModalContext | null,
): ShippingRateEstimateItem[] {
  return buildCreateOrderItems(groups, context).map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));
}

export function findBestExpressSellerPartner(
  partners: SellerShippingPartnerApiItem[],
): SellerShippingPartnerApiItem | null {
  if (partners.length === 0) {
    return null;
  }

  const normalize = (value: string | null | undefined) =>
    (value ?? '').trim().toLowerCase();

  const byCode = partners.find(
    partner => normalize(partner.shipping_partner.code) === 'best-express',
  );
  if (byCode) {
    return byCode;
  }

  return (
    partners.find(partner => {
      const name = normalize(partner.shipping_partner.name);
      return name.includes('best') && name.includes('express');
    }) ?? null
  );
}

export function getEstimatePartnerId(
  shippingPartnerOptions: CreateOrderSelectOption[],
  partnerRowId: number | null,
): number | null {
  if (partnerRowId == null) {
    return null;
  }

  return (
    shippingPartnerOptions.find(option => option.id === partnerRowId)
      ?.estimatePartnerId ?? null
  );
}

/** Chuỗi từ field province/district/ward của API (string hoặc object có `name`). */
export function labelFromCustomerLocationField(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const tryStr = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
    const keys = [
      'name',
      'province_name',
      'district_name',
      'ward_name',
      'full_name',
      'title',
      'label',
    ] as const;

    for (const key of keys) {
      const label = tryStr(record[key]);
      if (label.length > 0) {
        return label;
      }
    }
  }

  return '';
}

/** Suy tỉnh/quận/phường từ `full_address` dạng "…, phường, quận, tỉnh". */
export function inferLocationLabelsFromFullAddress(fullRaw: string): {
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
} {
  const parts = fullRaw
    .split(',')
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);

  if (parts.length < 3) {
    return { provinceLabel: '', districtLabel: '', wardLabel: '' };
  }

  return {
    provinceLabel: parts[parts.length - 1] ?? '',
    districtLabel: parts[parts.length - 2] ?? '',
    wardLabel: parts[parts.length - 3] ?? '',
  };
}

/** Tỉnh / quận / phường để khớp Best Express (ưu tiên field API, fallback full_address). */
export function resolveCustomerLocationLabelsForOrder(
  customer: Pick<
    CustomerSearchResult,
    'provinceLabel' | 'districtLabel' | 'wardLabel' | 'fullAddress'
  >,
): { provinceLabel: string; districtLabel: string; wardLabel: string } {
  let provinceLabel = customer.provinceLabel.trim();
  let districtLabel = customer.districtLabel.trim();
  let wardLabel = customer.wardLabel.trim();

  if (!provinceLabel && !districtLabel && !wardLabel) {
    const inferred = inferLocationLabelsFromFullAddress(customer.fullAddress.trim());
    provinceLabel = inferred.provinceLabel;
    districtLabel = inferred.districtLabel;
    wardLabel = inferred.wardLabel;
  }

  return { provinceLabel, districtLabel, wardLabel };
}

/** So khớp tên địa danh (API khách ↔ Best Express). */
export function normalizeLocationCompareKey(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function bestExpressRowByLabel<T extends { name: string }>(
  list: T[],
  targetRaw: string,
): T | undefined {
  const target = normalizeLocationCompareKey(targetRaw);
  if (!target) {
    return undefined;
  }

  const exact = list.find(row => normalizeLocationCompareKey(row.name) === target);
  if (exact) {
    return exact;
  }

  return list.find(row => {
    const name = normalizeLocationCompareKey(row.name);
    return name.includes(target) || target.includes(name);
  });
}

/** Bỏ tỉnh/quận/phường ở cuối full_address để chỉ còn đường/số nhà. */
export function stripTrailingLocationSegments(
  fullRaw: string,
  ward: string,
  district: string,
  province: string,
): string {
  const full = fullRaw.trim();
  if (!full) {
    return '';
  }

  const parts = full
    .split(',')
    .flatMap(segment => {
      const trimmed = segment.trim();
      return trimmed ? [trimmed] : [];
    });

  if (parts.length === 0) {
    return '';
  }

  const keysMatch = (segment: string, label: string) => {
    const segmentKey = normalizeLocationCompareKey(segment);
    const labelKey = normalizeLocationCompareKey(label);
    if (!segmentKey || !labelKey) {
      return false;
    }
    return (
      segmentKey === labelKey ||
      segmentKey.includes(labelKey) ||
      labelKey.includes(segmentKey)
    );
  };

  const tryStrip = (label: string) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel || parts.length === 0) {
      return;
    }

    const last = parts[parts.length - 1];
    if (last && keysMatch(last, trimmedLabel)) {
      parts.pop();
    }
  };

  tryStrip(province);
  tryStrip(district);
  tryStrip(ward);

  return parts.join(', ');
}

export function resolveCustomerRecipientAddress(
  customer: Pick<CustomerSearchResult, 'address' | 'fullAddress'> & {
    provinceLabel: string;
    districtLabel: string;
    wardLabel: string;
  },
): string {
  const street = customer.address.trim();
  const full = customer.fullAddress.trim();
  const { wardLabel, districtLabel, provinceLabel } =
    resolveCustomerLocationLabelsForOrder(customer);

  if (street) {
    return street;
  }

  if (!full) {
    return '';
  }

  if (wardLabel || districtLabel || provinceLabel) {
    const stripped = stripTrailingLocationSegments(
      full,
      wardLabel,
      districtLabel,
      provinceLabel,
    ).trim();
    return stripped.length > 0 ? stripped : full;
  }

  return full;
}
