export type PaymentListCurrencyApi = {
  id: number;
  code: string;
  symbol: string;
};

export type PaymentListCustomerApi = {
  id?: number;
  name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

/** Đơn bán (`sale_order` trong JSON). */
export type PaymentListSaleOrderApi = {
  id?: number;
  order_number?: string | null;
  buyer_name?: string | null;
  customer?: PaymentListCustomerApi | null;
  currency?: PaymentListCurrencyApi | null;
  payment_status?: string | null;
  total?: string | number | null;
};

export type PaymentListSellerApi = {
  id: number;
  name?: string | null;
  code?: string | null;
  email?: string | null;
};

/** Một dòng GET /payments (API v2). */
export type PaymentListItemApi = {
  id: number;
  uuid?: string | null;
  sale_order_id?: number | null;
  seller_id?: number | null;
  type?: string | null;
  amount: number | string;
  payment_method?: string | null;
  reference_number?: string | null;
  gateway_transaction_id?: string | null;
  is_gateway_payment?: boolean;
  status: string;
  paid_at?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  /** JSON snake_case */
  sale_order?: PaymentListSaleOrderApi | null;
  /** Một số client/serializer có thể trả camelCase */
  saleOrder?: PaymentListSaleOrderApi | null;
  seller?: PaymentListSellerApi | null;
  /** Tương thích bản map cũ (nếu API khác) */
  order?: PaymentListSaleOrderApi | null;
  customer?: PaymentListCustomerApi | null;
  currency?: PaymentListCurrencyApi | null;
  reference?: string | null;
  payment_number?: string | null;
  transaction_id?: string | null;
  payment_type?: string | null;
};

export type PaymentsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type PaymentsListApiResponse = {
  success: boolean;
  message?: string;
  data?: PaymentListItemApi[];
  meta?: PaymentsListMeta;
};

export type PaymentAttachmentUploaderApi = {
  id?: number;
  name?: string | null;
};

export type PaymentAttachmentApi = {
  id: number;
  original_name?: string | null;
  file_name?: string | null;
  url?: string | null;
  created_at?: string | null;
  uploader?: PaymentAttachmentUploaderApi | null;
};

export type PaymentProcessorApi = {
  id?: number;
  name?: string | null;
  email?: string | null;
};

export type PaymentBankAccountApi = {
  bank_code?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  account_name?: string | null;
};

export type PaymentDetailDataApi = PaymentListItemApi & {
  bank_account?: PaymentBankAccountApi | null;
  processor?: PaymentProcessorApi | null;
  attachments?: PaymentAttachmentApi[] | null;
};

export type PaymentDetailApiResponse = {
  success: boolean;
  message?: string;
  data?: PaymentDetailDataApi;
};
