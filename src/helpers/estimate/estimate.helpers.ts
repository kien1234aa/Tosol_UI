import { estimateConfig } from '@/src/configs/estimate';
import { convertCnyToVnd } from '@/src/helpers/search';
import type {
  EstimateForm,
  EstimateMode,
  EstimateResult,
} from '@/src/types/estimate/estimate.types';

function parseNumber(value: string): number {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Compute a mock cost estimate. Shipping is charged on the larger of the real
 * weight and the volumetric weight (L×W×H / divisor).
 */
export function computeEstimate(
  mode: EstimateMode,
  form: EstimateForm,
): EstimateResult {
  const weightKg = parseNumber(form.weightKg);
  const lengthCm = parseNumber(form.lengthCm);
  const widthCm = parseNumber(form.widthCm);
  const heightCm = parseNumber(form.heightCm);

  const volumetricKg =
    (lengthCm * widthCm * heightCm) / estimateConfig.volumetricDivisor;
  const chargeableWeightKg = Math.max(weightKg, volumetricKg);
  const shippingVnd = Math.round(
    chargeableWeightKg * estimateConfig.shippingPerKgVnd,
  );

  const goodsVnd =
    mode === 'buyForMe' ? convertCnyToVnd(parseNumber(form.priceCny)) : 0;
  const serviceFeeVnd =
    mode === 'buyForMe'
      ? Math.round(goodsVnd * estimateConfig.serviceFeeRate)
      : 0;

  const totalVnd = goodsVnd + serviceFeeVnd + shippingVnd;

  return {
    mode,
    chargeableWeightKg: Math.round(chargeableWeightKg * 100) / 100,
    shippingVnd,
    goodsVnd,
    serviceFeeVnd,
    totalVnd,
  };
}
