import { getJsonPaginated, postJson } from '@/src/apis/http';
import {
  apiEndpoints,
  customerSearchMinLength,
  customersPageSize,
} from '@/src/configs/api';
import type { CreateCustomerPayload } from '@/src/types/customers/customer.types';
import type { CustomerApiItem } from '@/src/types/orders/createOrder.types';

export interface ICustomersService {
  search(query: string, perPage?: number): Promise<CustomerApiItem[]>;
  create(payload: CreateCustomerPayload): Promise<CustomerApiItem>;
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

  async create(payload: CreateCustomerPayload): Promise<CustomerApiItem> {
    return postJson<CustomerApiItem>(apiEndpoints.customers, payload);
  }
}

export const customersService: ICustomersService = new HttpCustomersService();
