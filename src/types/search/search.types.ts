/** Domain models for the search tab. */

export type SearchPlatformKey = 'taobao' | '1688' | 'tmall' | 'jd';

export interface SearchPlatformItem {
  key: SearchPlatformKey;
  label: string;
}

/** A product shown in the search results grid. */
export interface SearchProduct {
  id: string;
  name: string;
  /** Source price in Chinese Yuan (CNY). */
  priceCny: number;
  originalPriceCny?: number;
  description: string;
  seller: string;
  rating: number;
  soldCount: number;
}

export interface ProductDetailPricing {
  unitPriceCny: number;
  unitPriceVnd: number;
  totalPriceCny: number;
  totalPriceVnd: number;
  originalUnitPriceCny?: number;
  originalUnitPriceVnd?: number;
  exchangeRate: number;
  discountPercent: number | null;
}
