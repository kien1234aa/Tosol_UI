/** Domain models for the "ước tính chi phí" (cost estimate) feature. */

export type EstimateMode = 'buyForMe' | 'consignment';

export interface EstimateForm {
  priceCny: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
}

export interface EstimateErrors {
  priceCny?: string;
  weightKg?: string;
}

export interface EstimateResult {
  mode: EstimateMode;
  chargeableWeightKg: number;
  shippingVnd: number;
  goodsVnd: number;
  serviceFeeVnd: number;
  totalVnd: number;
}
