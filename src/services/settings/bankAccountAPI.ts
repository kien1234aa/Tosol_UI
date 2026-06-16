import axios from 'axios';
import api from '@shared/services/api';
import type {
  BankAccountListApiResponse,
  BankAccountListItem,
  BankAccountListResult,
  BankAccountMutationApiResponse,
} from './bankAccountResponseTypes';

export type BankAccountDirectoryQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  /** `true` / `false` = lọc theo trạng thái; bỏ qua = tất cả. */
  isActive?: boolean;
  /** `yes` = `filter[is_default]=true`; `no` = `false`. */
  isDefaultFilter?: 'yes' | 'no';
  /** Lọc theo seller (admin / chi tiết seller). */
  sellerId?: number;
  signal?: AbortSignal;
};

export async function getBankAccountDirectory(
  q: BankAccountDirectoryQuery,
): Promise<BankAccountListResult> {
  const params: Record<string, string | number | boolean> = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
  };
  const s = q.search?.trim();
  if (s) {
    params.search = s;
  }
  if (q.isActive === true) {
    params['filter[is_active]'] = true;
  } else if (q.isActive === false) {
    params['filter[is_active]'] = false;
  }
  if (q.isDefaultFilter === 'yes') {
    params['filter[is_default]'] = true;
  } else if (q.isDefaultFilter === 'no') {
    params['filter[is_default]'] = false;
  }
  if (q.sellerId != null && Number.isFinite(q.sellerId)) {
    params['filter[seller_id]'] = q.sellerId;
  }
  const response = await api.get<BankAccountListApiResponse>('/bank-accounts', {
    params,
    signal: q.signal,
  });
  const body = response.data;
  if (!body.success || body.data === undefined || !body.meta) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được danh sách tài khoản',
    );
  }
  return { accounts: body.data, meta: body.meta };
}

export type CreateBankAccountPayload = {
  bank_code: string;
  /** Tên hiển thị ngân hàng (vd. từ Sepay `short_name`, khớp backend). */
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  is_active: boolean;
};

type BankAccountWriteApiResponse = {
  success: boolean;
  message: string;
  data?: BankAccountListItem;
};

function bankAccountWriteBody(payload: CreateBankAccountPayload) {
  return {
    bank_code: payload.bank_code.trim(),
    bank_name: payload.bank_name.trim(),
    account_number: payload.account_number.trim(),
    account_name: payload.account_name.trim(),
    is_default: payload.is_default,
    is_active: payload.is_active,
  };
}

/** GET `/bank-accounts/:id` — chi tiết một tài khoản. */
export async function getBankAccountById(
  id: number,
): Promise<BankAccountListItem> {
  try {
    const { data } = await api.get<BankAccountWriteApiResponse>(
      `/bank-accounts/${id}`,
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được tài khoản',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tải được tài khoản');
  }
}

/** POST `/bank-accounts` — tạo tài khoản ngân hàng. */
export async function createBankAccount(
  payload: CreateBankAccountPayload,
): Promise<BankAccountListItem> {
  try {
    const bodyJson = bankAccountWriteBody(payload);
    const { data } = await api.post<BankAccountWriteApiResponse>(
      '/bank-accounts',
      bodyJson,
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được tài khoản',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tạo được tài khoản');
  }
}

/** PUT `/bank-accounts/:id` — backend yêu cầu kèm `seller_id`. */
export type UpdateBankAccountPayload = CreateBankAccountPayload & {
  seller_id: number;
};

function bankAccountUpdateBody(payload: UpdateBankAccountPayload) {
  return {
    seller_id: payload.seller_id,
    bank_code: payload.bank_code.trim(),
    bank_name: payload.bank_name.trim(),
    account_number: payload.account_number.trim(),
    account_name: payload.account_name.trim(),
    is_default: payload.is_default,
    is_active: payload.is_active,
  };
}

/** PUT `/bank-accounts/:id` — cập nhật tài khoản ngân hàng. */
export async function updateBankAccount(
  id: number,
  payload: UpdateBankAccountPayload,
): Promise<BankAccountListItem> {
  try {
    const bodyJson = bankAccountUpdateBody(payload);
    const { data } = await api.put<BankAccountWriteApiResponse>(
      `/bank-accounts/${id}`,
      bodyJson,
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không cập nhật được tài khoản',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không cập nhật được tài khoản');
  }
}

/** POST `/bank-accounts/:id/set-default` */
export async function setBankAccountAsDefault(id: number): Promise<void> {
  try {
    const { data } = await api.post<BankAccountMutationApiResponse>(
      `/bank-accounts/${id}/set-default`,
      {},
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không đặt được tài khoản mặc định',
      );
    }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không đặt được tài khoản mặc định');
  }
}

/** POST `/bank-accounts/:id/deactivate` */
export async function deactivateBankAccount(
  id: number,
): Promise<BankAccountListItem> {
  try {
    const { data } = await api.post<BankAccountWriteApiResponse>(
      `/bank-accounts/${id}/deactivate`,
      {},
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không vô hiệu hóa được tài khoản',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không vô hiệu hóa được tài khoản');
  }
}

/** POST `/bank-accounts/:id/activate` */
export async function activateBankAccount(
  id: number,
): Promise<BankAccountListItem> {
  try {
    const { data } = await api.post<BankAccountWriteApiResponse>(
      `/bank-accounts/${id}/activate`,
      {},
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không kích hoạt được tài khoản',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không kích hoạt được tài khoản');
  }
}

/** DELETE `/bank-accounts/:id` — xóa tài khoản ngân hàng. */
export async function deleteBankAccount(id: number): Promise<void> {
  try {
    const { data } = await api.delete<unknown>(`/bank-accounts/${id}`);
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      (data as { success: boolean }).success === false
    ) {
      const m = (data as { message?: string }).message;
      throw new Error(typeof m === 'string' ? m : 'Không xóa được tài khoản');
    }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không xóa được tài khoản');
  }
}
