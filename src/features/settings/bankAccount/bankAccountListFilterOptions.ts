/**
 * Danh sách tài khoản ngân hàng — `getBankAccountDirectory` / `fetchBankAccountDirectory`.
 */
export type BankAccountIsDefaultFilter = 'all' | 'yes' | 'no';

export type BankAccountStatusFilter = 'all' | 'active' | 'inactive';

export const BANK_ACCOUNT_IS_DEFAULT_OPTIONS: {
  key: BankAccountIsDefaultFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'yes', label: 'Có' },
  { key: 'no', label: 'Không' },
];

export const BANK_ACCOUNT_STATUS_OPTIONS: {
  key: BankAccountStatusFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'inactive', label: 'Không hoạt động' },
];
