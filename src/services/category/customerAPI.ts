import { createApiService } from '@services/_core/createApiService';
import { throwApiError } from '@services/_core/apiHelpers';
import type {
  CreateCustomerPayload,
  CustomerDetailApi,
  CustomerListItemApi,
  CustomersListApiResponse,
  UpdateCustomerPayload,
} from './customerApiTypes';
import {
  mapCustomerListRowToSearchItem,
  type CustomerSearchItem,
} from './customerApiTypes';

export const customerService = createApiService<
  CustomerListItemApi,
  CustomerDetailApi,
  CreateCustomerPayload,
  UpdateCustomerPayload
>('/customers', {
  errorMessages: {
    list:   'Không tải được danh sách khách hàng',
    detail: 'Không tải được khách hàng',
    create: 'Không tạo được khách hàng',
    update: 'Không cập nhật được khách hàng',
    delete: 'Không xóa được khách hàng',
  },
});

export type GetCustomersParams = {
  page?: number;
  per_page?: number;
  search?: string;
  signal?: AbortSignal;
};

export async function getCustomers(
  params: GetCustomersParams = {},
): Promise<CustomersListApiResponse> {
  return customerService.getList(params) as Promise<CustomersListApiResponse>;
}

export type GetCustomerParams = {
  signal?: AbortSignal;
  includeSeller?: boolean;
};

export async function getCustomer(
  id: number,
  params: GetCustomerParams = {},
): Promise<CustomerDetailApi> {
  const { signal, includeSeller = true } = params;
  return customerService.getById(
    id,
    includeSeller ? { include: 'seller' } : undefined,
    { signal },
  );
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<CustomerListItemApi> {
  return customerService.create({ ...payload, is_active: true } as CreateCustomerPayload) as Promise<CustomerListItemApi>;
}

export async function updateCustomer(
  id: number,
  payload: UpdateCustomerPayload,
): Promise<CustomerDetailApi> {
  return customerService.update(id, payload);
}

export async function deleteCustomer(id: number): Promise<void> {
  return customerService.delete(id);
}

export type SearchCustomersParams = {
  search: string;
  perPage?: number;
  signal?: AbortSignal;
};

export type SearchCustomersResult = {
  customers: CustomerSearchItem[];
};

export async function searchCustomers({
  search,
  perPage = 20,
  signal,
}: SearchCustomersParams): Promise<SearchCustomersResult> {
  try {
    const res = await customerService.getList({
      per_page: perPage,
      search,
      signal,
    });
    return {
      customers: (res.data ?? []).map(mapCustomerListRowToSearchItem),
    };
  } catch (e) {
    throwApiError(e, 'Không tải được danh sách khách hàng');
  }
}

export type {
  CustomerSearchItem,
  CreateCustomerPayload,
} from './customerApiTypes';
