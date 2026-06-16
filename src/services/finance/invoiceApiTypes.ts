/** Phản hồi GET /invoices (include seller, totals, totals.currency). */

export type InvoiceCurrencyApi = {
  id: number;
  code: string;
  symbol: string;
  name: string;
};

export type InvoiceTotalApi = {
  id: number;
  invoice_id: number;
  currency_id: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  currency?: InvoiceCurrencyApi | null;
};

export type InvoiceSellerApi = {
  id: number;
  name: string;
  code?: string | null;
  legacy_id?: string | null;
};

export type InvoiceWarehouseApi = {
  id: number;
  name: string;
  code?: string | null;
};

export type InvoiceSettlementApi = {
  id: number;
  settlement_number?: string | null;
  reference?: string | null;
};

export type InvoiceLineItemApi = {
  id: number;
  description?: string | null;
  name?: string | null;
  type?: string | null;
  quantity?: number | string | null;
  unit_price?: number | string | null;
  total_amount?: number | string | null;
  line_total?: number | string | null;
  currency?: InvoiceCurrencyApi | null;
};

export type InvoiceApi = {
  id: number;
  invoice_number: string;
  seller_id: number;
  warehouse_id: number | null;
  settlement_id: number | null;
  billing_period_from: string | null;
  billing_period_to: string | null;
  status: string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  seller?: InvoiceSellerApi | null;
  totals?: InvoiceTotalApi[] | null;
  warehouse?: InvoiceWarehouseApi | null;
  settlement?: InvoiceSettlementApi | null;
  items?: InvoiceLineItemApi[] | null;
  invoice_items?: InvoiceLineItemApi[] | null;
};

export type InvoicesListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type InvoicesListApiResponse = {
  success: boolean;
  message?: string;
  data?: InvoiceApi[];
  meta?: InvoicesListMeta;
};

export type InvoiceDetailApiResponse = {
  success: boolean;
  message?: string;
  data?: InvoiceApi;
};
