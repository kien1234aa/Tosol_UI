import { getJsonPaginated } from '@/src/apis/http';
import {
  apiEndpoints,
  customerSearchMinLength,
  customersPageSize,
} from '@/src/configs/api';
import type { CustomerApiItem } from '@/src/types/orders/createOrder.types';

export interface ICustomersService {
  search(query: string, perPage?: number): Promise<CustomerApiItem[]>;
}

class HttpCustomersService implements ICustomersService {
  async search(
    query: string,
    perPage = customersPageSize,
  ): Promise<CustomerApiItem[]> {
    const trimmed = query.trim();

    if (trimmed.length < customerSearchMinLength) {
      return [];
    }

    const { data } = await getJsonPaginated<CustomerApiItem[]>(
      apiEndpoints.customers,
      {
        per_page: perPage,
        'filter[search]': trimmed,
      },
    );

    return data;
  }
}

export const customersService: ICustomersService = new HttpCustomersService();
