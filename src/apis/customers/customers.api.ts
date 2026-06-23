import { getJson, getJsonPaginated, postJson } from '@/src/apis/http';
import {
  apiEndpoints,
  customerSearchMinLength,
  customersPageSize,
} from '@/src/configs/api';
import type { CreateCustomerPayload } from '@/src/types/customers/customer.types';
import type { CustomerApiItem } from '@/src/types/orders/createOrder.types';

export interface ICustomersService {
  search(query: string, perPage?: number): Promise<CustomerApiItem[]>;
  getById(customerId: number): Promise<CustomerApiItem>;
  create(payload: CreateCustomerPayload): Promise<CustomerApiItem>;
}

export async function getCustomerById(
  customerId: number,
): Promise<CustomerApiItem> {
  return getJson<CustomerApiItem>(apiEndpoints.customerDetail(customerId));
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

  async getById(customerId: number): Promise<CustomerApiItem> {
    return getCustomerById(customerId);
  }

  async create(payload: CreateCustomerPayload): Promise<CustomerApiItem> {
    return postJson<CustomerApiItem>(apiEndpoints.customers, payload);
  }
}

export const customersService: ICustomersService = new HttpCustomersService();
