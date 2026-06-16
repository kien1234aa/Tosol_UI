/** GET `/payment-gateways?include=paymentGateway` — cổng thanh toán lồng nhau. */

export type PaymentGatewayNestedApi = {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  credentials_schema: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

/** Một dòng kết nối seller ↔ cổng thanh toán. */
export type SellerPaymentGatewayApi = {
  id: number;
  seller_id: number;
  payment_gateway_id: number;
  is_active: boolean;
  is_ready: boolean;
  credentials: Record<string, string> | null;
  payment_gateway: PaymentGatewayNestedApi;
  created_at: string;
  updated_at: string;
};

export type PaymentGatewayListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type PaymentGatewaysApiResponse = {
  success: boolean;
  message: string;
  data?: SellerPaymentGatewayApi[];
  meta?: PaymentGatewayListMeta;
};
