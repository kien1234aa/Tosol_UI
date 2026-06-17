import { postJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type {
  ShippingEstimateData,
  ShippingRateEstimatePayload,
} from '@/src/types/orders/shippingEstimate.types';

export interface IShippingRatesService {
  estimateCost(payload: ShippingRateEstimatePayload): Promise<ShippingEstimateData>;
}

class HttpShippingRatesService implements IShippingRatesService {
  async estimateCost(
    payload: ShippingRateEstimatePayload,
  ): Promise<ShippingEstimateData> {
    return postJson<ShippingEstimateData>(
      apiEndpoints.shippingRatesEstimateCost,
      payload,
    );
  }
}

export const shippingRatesService: IShippingRatesService =
  new HttpShippingRatesService();
