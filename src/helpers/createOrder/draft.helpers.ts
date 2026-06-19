import { exchangeConfig } from '@/src/configs/search';
import { draftCopy, draftQuantityLimits } from '@/src/configs/createOrder/draft.constants';
import type {
  DraftOrder,
  DraftProductGroup,
  DraftGroupCosts,
  DraftProductItem,
} from '@/src/types/createOrderDraft/createOrderDraft.types';
import type { CreateOrderFormState } from '@/src/types/orders/createOrder.types';

export function convertCnyToVnd(
  cny: number,
  rate: number = exchangeConfig.cnyToVnd,
): number {
  return Math.round(cny * rate);
}

export function formatCnyPrice(price: number): string {
  const hasFraction = !Number.isInteger(price);
  return `¥${price.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatVndPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

/** Hiển thị số tiền trong ô nhập (không kèm đơn vị). */
export function formatVndInputAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return '';
  }

  return amount.toLocaleString('vi-VN');
}

/** Format chuỗi chỉ-gồm-số thành dạng có dấu chấm phân cách hàng nghìn. */
export function formatVndInputDigits(digits: string): string {
  if (!digits) {
    return '';
  }

  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  return parsed.toLocaleString('vi-VN');
}

/** Parse giá trị ô nhập VND (bỏ dấu chấm/phẩy, chỉ lấy số). */
export function parseVndInputDigits(rawValue: string): number | null {
  const digits = rawValue.replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function computeLineSubtotalVnd(product: DraftProductItem): number {
  return getDraftUnitPriceVnd(product) * product.quantity;
}

export function getDraftUnitPriceVnd(product: DraftProductItem): number {
  if (product.priceVnd > 0) {
    return product.priceVnd;
  }

  return convertCnyToVnd(product.priceCny);
}

export function isDraftProductCustomPricing(product: DraftProductItem): boolean {
  return product.isCustomPricing === true;
}

export function getDraftProductTaxRatePercent(product: DraftProductItem): number {
  return product.taxRatePercent ?? 0;
}

export function validateCustomDraftProducts(
  groups: DraftProductGroup[],
): string | null {
  for (const group of groups) {
    for (const product of group.products) {
      if (getDraftUnitPriceVnd(product) <= 0) {
        return draftCopy.customPriceRequired.replace('{name}', product.name);
      }
    }
  }

  return null;
}

export function formatDraftUnitPrice(product: DraftProductItem): string {
  if (product.priceVnd > 0) {
    return formatVndPrice(product.priceVnd);
  }

  if (product.priceCny > 0) {
    return formatCnyPrice(product.priceCny);
  }

  return draftCopy.priceOnRequest;
}

export function computeGroupCosts(group: DraftProductGroup): DraftGroupCosts {
  const goodsVnd = group.products.reduce(
    (sum, product) => sum + computeLineSubtotalVnd(product),
    0,
  );
  const estimatedFeeVnd = Math.round(goodsVnd * 0.05);
  const depositVnd = Math.round(goodsVnd * 0.3);
  const totalVnd = goodsVnd + estimatedFeeVnd;

  return {
    goodsVnd,
    estimatedFeeVnd,
    depositVnd,
    totalVnd,
  };
}

export function computeGrandGoodsTotal(groups: DraftProductGroup[]): number {
  return groups.reduce(
    (sum, group) => sum + computeGroupCosts(group).goodsVnd,
    0,
  );
}

/** Total product quantity across all draft groups. */
export function countDraftProducts(groups: DraftProductGroup[]): number {
  return groups.reduce(
    (total, group) =>
      total +
      group.products.reduce((sum, product) => sum + product.quantity, 0),
    0,
  );
}

export function getDraftProductMaxQuantity(product: DraftProductItem): number {
  if (product.maxStock != null && product.maxStock > 0) {
    return Math.min(draftQuantityLimits.max, product.maxStock);
  }

  return draftQuantityLimits.max;
}

export function createDraftGroupId(): string {
  return `dg-${Date.now()}`;
}

export function createDraftOrderId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyDraftOrder(
  form: CreateOrderFormState,
): DraftOrder {
  const now = new Date().toISOString();

  return {
    id: createDraftOrderId(),
    createdAt: now,
    updatedAt: now,
    groups: [],
    form,
  };
}
