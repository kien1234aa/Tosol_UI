export type PriceListRowStatus = 'active' | 'inactive';

export type PriceListRow = {
  id: number;
  key: string;
  code: string;
  name: string;
  currencyCode: string;
  isDefault: boolean;
  status: PriceListRowStatus;
  validFromLabel: string;
  validToLabel: string;
  /** Hiển thị footer card — null khi không có cả ngày bắt đầu lẫn kết thúc. */
  validityLabel: string | null;
};
