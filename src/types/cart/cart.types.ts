/** Domain models for the cart tab. */

export interface CartProductItem {
  id: string;
  name: string;
  variant: string;
  priceCny: number;
  priceVnd: number;
  thumbnailUrl?: string | null;
  sku?: string;
  maxStock?: number;
  isOutOfStock?: boolean;
  quantity: number;
  selected: boolean;
}

export interface CartGroup {
  id: string;
  supplierName: string;
  products: CartProductItem[];
  insurance: boolean;
  woodPacking: boolean;
  note: string;
  selected: boolean;
}

export interface CartGroupCosts {
  goodsVnd: number;
  estimatedFeeVnd: number;
  depositVnd: number;
  totalVnd: number;
}

export interface CartGroupViewModel extends CartGroup {
  costs: CartGroupCosts;
}

/** Payload for adding a catalog product into the cart. */
export interface AddToCartPayload {
  productId: string;
  name: string;
  seller: string;
  priceCny: number;
  priceVnd: number;
  thumbnailUrl?: string | null;
  sku?: string;
  maxStock?: number;
  isOutOfStock?: boolean;
  quantity: number;
  variant: string;
}

export interface AddToCartResult {
  success: boolean;
  message?: string;
}
