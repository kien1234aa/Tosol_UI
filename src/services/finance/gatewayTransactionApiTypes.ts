import type {
  PaymentListItemApi,
  PaymentListSaleOrderApi,
} from './paymentApiTypes';

/** Một dòng GET payment-gateways/transactions/list (include payment, saleOrder). */
export type PaymentGatewayTransactionListItemApi = {
  id: number;
  uuid?: string | null;
  status: string;
  type?: string | null;
  amount?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  payment?: PaymentListItemApi | null;
  sale_order?: PaymentListSaleOrderApi | null;
  saleOrder?: PaymentListSaleOrderApi | null;
};

export type GatewayTransactionsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type GatewayTransactionsListApiResponse = {
  success: boolean;
  message?: string;
  data?: PaymentGatewayTransactionListItemApi[];
  meta?: GatewayTransactionsListMeta;
};
