/** Phản hồi GET /settlements (include seller, items, items.currency). */

export type SettlementCurrencyApi = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate?: string;
  decimal_places?: number;
  is_default?: boolean;
  is_active?: boolean;
};

export type SettlementItemApi = {
  id: number;
  settlement_id: number;
  currency_id: number;
  cod_collected: number;
  storage_fee: number;
  packing_fee: number;
  outbound_fee: number;
  inbound_fee: number;
  transfer_fee: number;
  shipping_fee: number;
  total_receivable: number;
  total_payable: number;
  net_amount: number;
  payment_direction: string;
  payable_amount: number;
  created_at: string;
  updated_at: string;
  currency?: SettlementCurrencyApi | null;
};

export type SettlementSellerApi = {
  id: number;
  name: string;
  code?: string | null;
  legacy_id?: string | null;
};

export type SettlementWarehouseApi = {
  id: number;
  name: string;
  code?: string | null;
  address?: string | null;
};

/** User gắn createdByUser / confirmedByUser / processedByUser (tên field theo include API). */
export type SettlementUserLiteApi = {
  id: number;
  name?: string | null;
  email?: string | null;
};

export type SettlementPaymentApi = {
  id: number;
  settlement_id?: number;
  amount?: number;
  currency_id?: number;
  status?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  currency?: SettlementCurrencyApi | null;
  /** snake_case từ serializer */
  processed_by_user?: SettlementUserLiteApi | null;
  /** camelCase nếu API trả vậy */
  processedByUser?: SettlementUserLiteApi | null;
};

export type SettlementApi = {
  id: number;
  settlement_number: string;
  seller_id: number;
  warehouse_id: number | null;
  period_from: string | null;
  period_to: string | null;
  status: string;
  confirmed_at: string | null;
  settled_at: string | null;
  notes: string | null;
  created_by?: number | null;
  confirmed_by?: number | null;
  created_at: string;
  updated_at: string;
  seller?: SettlementSellerApi | null;
  warehouse?: SettlementWarehouseApi | null;
  items?: SettlementItemApi[] | null;
  payments?: SettlementPaymentApi[] | null;
  created_by_user?: SettlementUserLiteApi | null;
  createdByUser?: SettlementUserLiteApi | null;
  confirmed_by_user?: SettlementUserLiteApi | null;
  confirmedByUser?: SettlementUserLiteApi | null;
  can_be_confirmed?: boolean;
  can_be_settled?: boolean;
  can_be_cancelled?: boolean;
  can_accept_payment?: boolean;
};

export type SettlementsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type SettlementsListApiResponse = {
  success: boolean;
  message?: string;
  data?: SettlementApi[];
  meta?: SettlementsListMeta;
};

export type SettlementDetailApiResponse = {
  success: boolean;
  message?: string;
  data?: SettlementApi;
};
