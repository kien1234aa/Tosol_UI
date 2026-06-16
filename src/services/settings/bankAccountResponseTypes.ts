export type BankAccountListItem = {
  id: number;
  seller_id: number;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BankAccountPaginationMeta = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

export type BankAccountListApiResponse = {
  success: boolean;
  message: string;
  data?: BankAccountListItem[];
  meta?: BankAccountPaginationMeta;
};

export type BankAccountListResult = {
  accounts: BankAccountListItem[];
  meta: BankAccountPaginationMeta;
};

/** POST `/bank-accounts/:id/set-default` — có thể trả một bản ghi hoặc chỉ `success`. */
export type BankAccountMutationApiResponse = {
  success: boolean;
  message: string;
  data?: BankAccountListItem;
};
