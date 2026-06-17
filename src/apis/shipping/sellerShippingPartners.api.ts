import { getJsonPaginated } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type { SellerShippingPartnerApiItem } from '@/src/types/orders/shippingEstimate.types';

export interface ISellerShippingPartnersService {
  listActive(): Promise<SellerShippingPartnerApiItem[]>;
}

class HttpSellerShippingPartnersService implements ISellerShippingPartnersService {
  async listActive(): Promise<SellerShippingPartnerApiItem[]> {
    const { data } = await getJsonPaginated<SellerShippingPartnerApiItem[]>(
      apiEndpoints.sellerShippingPartners,
      {
        per_page: 100,
        include: 'shippingPartner',
        'filter[is_active]': 1,
      },
    );

    return data.filter(item => item.is_active !== false);
  }
}

export const sellerShippingPartnersService: ISellerShippingPartnersService =
  new HttpSellerShippingPartnersService();
