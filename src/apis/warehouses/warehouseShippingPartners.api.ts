import { getJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type { WarehouseShippingPartnerApiItem } from '@/src/types/orders/createOrder.types';

export interface IWarehouseShippingPartnersService {
  listByWarehouseCode(warehouseCode: string): Promise<WarehouseShippingPartnerApiItem[]>;
}

class HttpWarehouseShippingPartnersService
  implements IWarehouseShippingPartnersService
{
  async listByWarehouseCode(
    warehouseCode: string,
  ): Promise<WarehouseShippingPartnerApiItem[]> {
    const code = warehouseCode.trim();

    if (!code) {
      return [];
    }

    const data = await getJson<WarehouseShippingPartnerApiItem[]>(
      apiEndpoints.warehouseShippingPartners(code),
    );

    return data.filter(item => item.is_active);
  }
}

export const warehouseShippingPartnersService: IWarehouseShippingPartnersService =
  new HttpWarehouseShippingPartnersService();
