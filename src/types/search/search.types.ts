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
  /** Legacy mock field; kept for product detail pricing helpers. */
  priceCny: number;
  originalPriceCny?: number;
  description: string;
  seller: string;
  rating: number;
  soldCount: number;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  priceVnd?: number;
  sku?: string;
  unit?: string;
  availableStock?: number;
  totalStock?: number;
  reservedStock?: number;
  warehousesCount?: number;
  isInStock?: boolean;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  volumetricWeight?: number;
  barcode?: string | null;
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
