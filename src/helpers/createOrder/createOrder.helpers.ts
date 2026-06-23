import { createOrderCopy } from '@/src/configs/createOrder/createOrder.constants';
import { isAllWarehouses } from '@/src/configs/warehouse';
import {
  getDraftProductTaxRatePercent,
  getDraftUnitPriceVnd,
} from '@/src/helpers/createOrder/draft.helpers';
import type { DraftProductGroup } from '@/src/types/createOrderDraft/createOrderDraft.types';
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
import type { BestExpressDistrict } from '@/src/types/orders/location.types';
import type {
  SellerShippingPartnerApiItem,
  ShippingRateEstimateItem,
  ShippingRateEstimatePayload,
} from '@/src/types/orders/shippingEstimate.types';

export interface BestExpressShipmentLocation {
  province: string;
  district: string;
  ward: string;
}

/** Địa chỉ 3 cấp (cũ) có phường/xã con; 2 cấp (mới) chọn thẳng phường/xã ở bước quận/huyện. */
export function isBestExpressWardRequired(
  district: Pick<BestExpressDistrict, 'children_count'> | null | undefined,
): boolean {
  return district != null && district.children_count > 0;
}

export function resolveBestExpressShipmentLocation(input: {
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
  isWardRequired: boolean;
}): BestExpressShipmentLocation {
  const province =
    input.provinceLabel !== createOrderCopy.selectProvince
      ? input.provinceLabel.trim()
      : '';
  const district =
    input.districtLabel !== createOrderCopy.selectDistrict
      ? input.districtLabel.trim()
      : '';
  const ward =
    input.wardLabel !== createOrderCopy.selectWard ? input.wardLabel.trim() : '';

  if (input.isWardRequired) {
    return { province, district, ward };
  }

  return {
    province,
    district: '',
    ward: district,
  };
}

export function resolveBestExpressCustomerLocation(input: {
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
  isWardRequired: boolean;
}): {
  province: string | null;
  district: string | null;
  ward: string | null;
} {
  const resolved = resolveBestExpressShipmentLocation(input);

  return {
    province: resolved.province || null,
    district: resolved.district || null,
    ward: resolved.ward || null,
  };
}

function getTargetDraftGroups(
  groups: DraftProductGroup[],
  context: CreateOrderModalContext | null,
): DraftProductGroup[] {
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
  groups: DraftProductGroup[],
  context: CreateOrderModalContext | null,
): CreateSaleOrderItemPayload[] {
  const items: CreateSaleOrderItemPayload[] = [];

  for (const group of getTargetDraftGroups(groups, context)) {
    for (const product of group.products) {
      const productId = Number(product.id);
      if (!Number.isFinite(productId) || productId <= 0) {
        continue;
      }

      items.push({
        product_id: productId,
        quantity: product.quantity,
        unit_price: getDraftUnitPriceVnd(product),
        discount_percent: 0,
        tax_rate: getDraftProductTaxRatePercent(product),
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
  groups: DraftProductGroup[];
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
  const partnerId = getEstimatePartnerId(
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
      ...(form.shippingMethod === 'seller_partner' && partnerId != null
        ? { shipping_partner_seller_id: partnerId }
        : {}),
      ...(form.shippingMethod === 'warehouse_partner' && partnerId != null
        ? { shipping_partner_warehouse_id: partnerId }
        : {}),
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
  isWardRequired: boolean,
): boolean {
  if (form.shippingMethod === 'customer_pickup') {
    return true;
  }

  const hasProvince =
    form.provinceId != null && provinceLabel !== createOrderCopy.selectProvince;
  const hasDistrict =
    form.districtId != null && districtLabel !== createOrderCopy.selectDistrict;

  if (!hasProvince || !hasDistrict) {
    return false;
  }

  if (!isWardRequired) {
    return true;
  }

  return form.wardId != null && wardLabel !== createOrderCopy.selectWard;
}

export function getOrderedDraftProductKeys(
  groups: DraftProductGroup[],
  context: CreateOrderModalContext | null,
): { groupId: string; productId: string }[] {
  const keys: { groupId: string; productId: string }[] = [];

  for (const group of getTargetDraftGroups(groups, context)) {
    for (const product of group.products) {
      keys.push({ groupId: group.id, productId: product.id });
    }
  }

  return keys;
}

export function buildEstimateDraftItems(
  groups: DraftProductGroup[],
  context: CreateOrderModalContext | null,
): ShippingRateEstimateItem[] {
  return buildCreateOrderItems(groups, context).map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));
}

export function computeCreateOrderGoodsTotalVnd(
  groups: DraftProductGroup[],
  context: CreateOrderModalContext | null,
): number {
  return buildCreateOrderItems(groups, context).reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
}

export function buildShippingRateEstimatePayload(input: {
  form: CreateOrderFormState;
  toProvince: string;
  toDistrict: string;
  toWard: string;
  items: ShippingRateEstimateItem[];
  activeWarehouseId: number;
  shippingPartnerOptions: CreateOrderSelectOption[];
  goodsTotalVnd: number;
}): ShippingRateEstimatePayload | null {
  const partnerId = getEstimatePartnerId(
    input.shippingPartnerOptions,
    input.form.warehousePartnerId,
  );

  if (partnerId == null) {
    return null;
  }

  const base = {
    to_province: input.toProvince,
    to_district: input.toDistrict,
    to_ward: input.toWard,
    items: input.items,
  };

  if (input.form.shippingMethod === 'warehouse_partner') {
    return {
      ...base,
      shipping_partner_warehouse_id: partnerId,
      cod_amount: input.form.isCodEnabled
        ? Math.max(0, input.goodsTotalVnd)
        : 0,
    };
  }

  if (input.form.shippingMethod === 'seller_partner') {
    return {
      ...base,
      shipping_partner_seller_id: partnerId,
      warehouse_id: input.activeWarehouseId,
    };
  }

  return null;
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

/** Chuẩn hóa SĐT khách từ API / preferences (string hoặc number). */
export function normalizeCustomerPhone(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
}

/** Chuỗi từ field province/district/ward của API (string hoặc object có `name`). */
export function labelFromCustomerLocationField(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      return '';
    }
    return trimmed;
  }
  if (typeof value === 'number') {
    return '';
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

const LOCATION_ADMIN_PREFIXES = [
  /^tinh\s+/,
  /^thanh pho\s+/,
  /^tp\.?\s+/,
  /^quan\s+/,
  /^huyen\s+/,
  /^thi xa\s+/,
  /^phuong\s+/,
  /^xa\s+/,
  /^thi tran\s+/,
];

/** So khớp tên địa danh (API khách ↔ Best Express). */
export function normalizeLocationCompareKey(value: string): string {
  let key = value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  for (const prefix of LOCATION_ADMIN_PREFIXES) {
    key = key.replace(prefix, '');
  }

  return key.trim();
}

const WARD_ADMIN_PREFIXES = [/^phuong\s+/, /^xa\s+/, /^thi tran\s+/];
const DISTRICT_ADMIN_PREFIXES = [
  /^quan\s+/,
  /^huyen\s+/,
  /^thi xa\s+/,
];

function normalizeLocationSegmentKey(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function looksLikeWardAdminUnit(segment: string): boolean {
  const key = normalizeLocationSegmentKey(segment);
  return WARD_ADMIN_PREFIXES.some(prefix => prefix.test(key));
}

function looksLikeDistrictAdminUnit(segment: string): boolean {
  const key = normalizeLocationSegmentKey(segment);
  return DISTRICT_ADMIN_PREFIXES.some(prefix => prefix.test(key));
}

/** Suy tỉnh/quận/phường từ `full_address`. Hỗ trợ cả "đường, quận, tỉnh" (3 phần) và "đường, phường, quận, tỉnh" (4+ phần). */
export function inferLocationLabelsFromFullAddress(fullRaw: string): {
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
} {
  const empty = { provinceLabel: '', districtLabel: '', wardLabel: '' };
  const parts = fullRaw
    .split(',')
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);

  if (parts.length < 2) {
    return empty;
  }

  const provinceLabel = parts[parts.length - 1] ?? '';

  if (parts.length === 2) {
    return { provinceLabel, districtLabel: '', wardLabel: '' };
  }

  const districtCandidate = parts[parts.length - 2] ?? '';
  const wardCandidate = parts[parts.length - 3] ?? '';

  if (parts.length === 3) {
    if (looksLikeDistrictAdminUnit(districtCandidate)) {
      return { provinceLabel, districtLabel: districtCandidate, wardLabel: '' };
    }

    if (looksLikeWardAdminUnit(districtCandidate)) {
      return {
        provinceLabel,
        districtLabel: '',
        wardLabel: districtCandidate,
      };
    }

    return { provinceLabel, districtLabel: districtCandidate, wardLabel: '' };
  }

  if (
    looksLikeWardAdminUnit(wardCandidate) &&
    looksLikeDistrictAdminUnit(districtCandidate)
  ) {
    return {
      provinceLabel,
      districtLabel: districtCandidate,
      wardLabel: wardCandidate,
    };
  }

  if (looksLikeDistrictAdminUnit(districtCandidate)) {
    return { provinceLabel, districtLabel: districtCandidate, wardLabel: '' };
  }

  if (looksLikeWardAdminUnit(wardCandidate)) {
    return {
      provinceLabel,
      districtLabel: districtCandidate,
      wardLabel: wardCandidate,
    };
  }

  return { provinceLabel, districtLabel: districtCandidate, wardLabel: '' };
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

  const inferred = inferLocationLabelsFromFullAddress(customer.fullAddress.trim());
  if (!provinceLabel) {
    provinceLabel = inferred.provinceLabel;
  }
  if (!districtLabel) {
    districtLabel = inferred.districtLabel;
  }
  if (!wardLabel) {
    wardLabel = inferred.wardLabel;
  } else if (!looksLikeWardAdminUnit(wardLabel)) {
    wardLabel = inferred.wardLabel || '';
  }

  return { provinceLabel, districtLabel, wardLabel };
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

  const fuzzy = list.find(row => {
    const name = normalizeLocationCompareKey(row.name);
    return name.includes(target) || target.includes(name);
  });
  if (fuzzy) {
    return fuzzy;
  }

  const targetTokens = target.split(' ').filter(token => token.length > 1);
  if (targetTokens.length === 0) {
    return undefined;
  }

  return list.find(row => {
    const name = normalizeLocationCompareKey(row.name);
    return targetTokens.every(token => name.includes(token));
  });
}

/** Khớp quận/huyện; fallback sang cấp lá (mô hình 2 cấp, vd. Quận Cẩm Lệ → Cẩm Lệ). */
export function bestExpressDistrictByLabel<
  T extends { name: string; children_count: number },
>(districtList: T[], districtLabel: string, wardLabel = ''): T | undefined {
  const districtTarget = districtLabel.trim();
  const wardTarget = wardLabel.trim();

  if (districtTarget) {
    const direct = bestExpressRowByLabel(districtList, districtTarget);
    if (direct) {
      return direct;
    }

    const leafFromDistrict = districtList.find(
      district =>
        district.children_count === 0 &&
        bestExpressRowByLabel([district], districtTarget) != null,
    );
    if (leafFromDistrict) {
      return leafFromDistrict;
    }
  }

  if (!wardTarget) {
    return undefined;
  }

  return districtList.find(
    district =>
      district.children_count === 0 &&
      bestExpressRowByLabel([district], wardTarget) != null,
  );
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
