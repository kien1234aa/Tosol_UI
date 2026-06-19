/** Domain models for the create-order draft (product list before submit). */

import type { CreateOrderFormState } from '@/src/types/orders/createOrder.types';

export interface DraftProductItem {
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
  /** True when the catalog product had no price at add time. */
  isCustomPricing?: boolean;
  /** True when the user manually changed unit price after add. */
  isPriceOverridden?: boolean;
  /** Tax rate percentage (0–100) for custom-priced items. */
  taxRatePercent?: number;
}

export interface DraftProductGroup {
  id: string;
  supplierName: string;
  insurance: boolean;
  woodPacking: boolean;
  note: string;
  products: DraftProductItem[];
}

export interface DraftGroupCosts {
  goodsVnd: number;
  estimatedFeeVnd: number;
  depositVnd: number;
  totalVnd: number;
}

export interface DraftProductGroupViewModel extends DraftProductGroup {
  costs: DraftGroupCosts;
}

/** Payload for adding a catalog product into the draft order. */
export interface AddDraftProductPayload {
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
  isCustomPricing?: boolean;
}

export interface AddDraftProductResult {
  success: boolean;
  message?: string;
}

/** One in-progress order draft (products + form snapshot). */
export interface DraftOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  groups: DraftProductGroup[];
  form: CreateOrderFormState;
}

export interface DraftOrderSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  goodsTotalVnd: number;
  title: string;
  subtitle: string;
}
