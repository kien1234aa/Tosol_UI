import { cartCopy, cartQuantityLimits } from '@/src/configs/cart';
import { exchangeConfig } from '@/src/configs/search';
import type {
  CartGroup,
  CartGroupCosts,
  CartProductItem,
} from '@/src/types/cart/cart.types';

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

export function computeLineSubtotalVnd(product: CartProductItem): number {
  return getCartUnitPriceVnd(product) * product.quantity;
}

export function getCartUnitPriceVnd(product: CartProductItem): number {
  if (product.priceVnd > 0) {
    return product.priceVnd;
  }

  return convertCnyToVnd(product.priceCny);
}

export function formatCartUnitPrice(product: CartProductItem): string {
  if (product.priceVnd > 0) {
    return formatVndPrice(product.priceVnd);
  }

  if (product.priceCny > 0) {
    return formatCnyPrice(product.priceCny);
  }

  return cartCopy.priceOnRequest;
}

export function computeGroupCosts(group: CartGroup): CartGroupCosts {
  const activeProducts = group.products.filter(
    product => product.selected && group.selected,
  );
  const goodsVnd = activeProducts.reduce(
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

export function computeGrandGoodsTotal(groups: CartGroup[]): number {
  return groups.reduce((sum, group) => sum + computeGroupCosts(group).goodsVnd, 0);
}

export function areAllItemsSelected(groups: CartGroup[]): boolean {
  if (groups.length === 0) {
    return false;
  }

  return groups.every(
    group =>
      group.selected &&
      group.products.every(product => product.selected),
  );
}

export function hasAnySelectedItem(groups: CartGroup[]): boolean {
  return groups.some(
    group =>
      group.selected && group.products.some(product => product.selected),
  );
}

/** Tổng số lượng sản phẩm trong giỏ (cộng quantity từng dòng). */
export function countCartProducts(groups: CartGroup[]): number {
  return groups.reduce(
    (total, group) =>
      total +
      group.products.reduce((sum, product) => sum + product.quantity, 0),
    0,
  );
}

export function getCartProductMaxQuantity(product: CartProductItem): number {
  if (product.maxStock != null && product.maxStock > 0) {
    return Math.min(cartQuantityLimits.max, product.maxStock);
  }

  return cartQuantityLimits.max;
}

export function buildDefaultVariant(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return 'Mặc định';
  }
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}

export function createCartGroupId(): string {
  return `cg-${Date.now()}`;
}
