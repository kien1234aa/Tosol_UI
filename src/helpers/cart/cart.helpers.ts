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
  return convertCnyToVnd(product.priceCny * product.quantity);
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
