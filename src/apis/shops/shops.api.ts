import { getJsonPaginated } from '@/src/apis/http';
import { apiEndpoints, shopsPageSize } from '@/src/configs/api';
import type { ShopApiItem } from '@/src/types/orders/createOrder.types';

export interface IShopsService {
  listActive(): Promise<ShopApiItem[]>;
}

class HttpShopsService implements IShopsService {
  async listActive(): Promise<ShopApiItem[]> {
    const { data } = await getJsonPaginated<ShopApiItem[]>(apiEndpoints.shops, {
      per_page: shopsPageSize,
      'filter[is_active]': 'true',
    });

    return data.filter(shop => shop.is_active);
  }
}

export const shopsService: IShopsService = new HttpShopsService();
