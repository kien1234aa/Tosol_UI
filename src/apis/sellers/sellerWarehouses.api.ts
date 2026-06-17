import { getJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type { SellerWarehouseApiItem } from '@/src/types/orders/createOrder.types';

export interface ISellerWarehousesService {
  listBySellerCode(sellerCode: string): Promise<SellerWarehouseApiItem[]>;
}

class HttpSellerWarehousesService implements ISellerWarehousesService {
  async listBySellerCode(sellerCode: string): Promise<SellerWarehouseApiItem[]> {
    const data = await getJson<SellerWarehouseApiItem[]>(
      apiEndpoints.sellerWarehouses(sellerCode),
    );

    return data.filter(warehouse => warehouse.is_active);
  }
}

export const sellerWarehousesService: ISellerWarehousesService =
  new HttpSellerWarehousesService();
