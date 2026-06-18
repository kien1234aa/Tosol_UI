import { exchangeConfig } from '@/src/configs/search';
import type {
  ProductDetailPricing,
  SearchProduct,
} from '@/src/types/search/search.types';

/** Formats a VND price for display. */
export function formatProductPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

/** Formats a CNY price for display. */
export function formatCnyPrice(price: number): string {
  const hasFraction = !Number.isInteger(price);
  return `¥${price.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Converts CNY to VND using the configured mock exchange rate. */
export function convertCnyToVnd(
  cny: number,
  rate: number = exchangeConfig.cnyToVnd,
): number {
  return Math.round(cny * rate);
}

export function getProductUnitPriceVnd(product: SearchProduct): number {
  return convertCnyToVnd(product.priceCny);
}

export function filterSearchProducts(
  products: SearchProduct[],
  query: string,
): SearchProduct[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return products;
  }
  return products.filter(product =>
    product.name.toLowerCase().includes(normalized),
  );
}

/** Lower rank = higher priority in search results. */
export function getSearchProductStockRank(product: SearchProduct): number {
  const availableStock = product.availableStock ?? 0;

  if (product.isOutOfStock || availableStock <= 0) {
    return 3;
  }

  if (product.isInStock) {
    return 0;
  }

  if (product.isLowStock) {
    return 1;
  }

  return 2;
}

/**
 * Sorts loaded catalog items so in-stock products appear first.
 * Works on the client-side accumulated paginated list.
 */
export function sortSearchProductsByStockPriority(
  products: SearchProduct[],
  productPreferenceScores?: ReadonlyMap<string, number>,
): SearchProduct[] {
  return [...products].sort((a, b) => {
    const rankDiff =
      getSearchProductStockRank(a) - getSearchProductStockRank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const stockDiff = (b.availableStock ?? 0) - (a.availableStock ?? 0);
    if (stockDiff !== 0) {
      return stockDiff;
    }

    if (productPreferenceScores) {
      const prefDiff =
        (productPreferenceScores.get(b.id) ?? 0) -
        (productPreferenceScores.get(a.id) ?? 0);
      if (prefDiff !== 0) {
        return prefDiff;
      }
    }

    return a.name.localeCompare(b.name, 'vi');
  });
}

export function getProductById(
  products: SearchProduct[],
  productId: string,
): SearchProduct | undefined {
  return products.find(product => product.id === productId);
}

export function formatSoldCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  }
  return String(count);
}

export function getDiscountPercent(
  price: number,
  originalPrice?: number,
): number | null {
  if (originalPrice == null || originalPrice <= price) {
    return null;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function buildProductDetailPricing(
  product: SearchProduct,
  quantity: number,
  exchangeRate: number = exchangeConfig.cnyToVnd,
): ProductDetailPricing {
  if (product.priceVnd != null) {
    const unitPriceVnd = product.priceVnd;
    const totalPriceVnd = unitPriceVnd * quantity;

    return {
      unitPriceCny: unitPriceVnd > 0 ? unitPriceVnd / exchangeRate : 0,
      unitPriceVnd,
      totalPriceCny: totalPriceVnd > 0 ? totalPriceVnd / exchangeRate : 0,
      totalPriceVnd,
      exchangeRate,
      discountPercent: getDiscountPercent(
        product.priceCny,
        product.originalPriceCny,
      ),
    };
  }

  const unitPriceCny = product.priceCny;
  const totalPriceCny = unitPriceCny * quantity;
  const unitPriceVnd = convertCnyToVnd(unitPriceCny, exchangeRate);
  const totalPriceVnd = convertCnyToVnd(totalPriceCny, exchangeRate);
  const originalUnitPriceCny = product.originalPriceCny;
  const originalUnitPriceVnd =
    originalUnitPriceCny != null
      ? convertCnyToVnd(originalUnitPriceCny, exchangeRate)
      : undefined;

  return {
    unitPriceCny,
    unitPriceVnd,
    totalPriceCny,
    totalPriceVnd,
    originalUnitPriceCny,
    originalUnitPriceVnd,
    exchangeRate,
    discountPercent: getDiscountPercent(unitPriceCny, originalUnitPriceCny),
  };
}

export function formatExchangeRate(rate: number): string {
  return `1¥ = ${rate.toLocaleString('vi-VN')}đ`;
}
