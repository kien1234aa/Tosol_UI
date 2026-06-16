export type ReturnOrdersListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type ReturnOrderProduct = {
  id?: number;
  name?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
};

export type ReturnOrderLine = {
  id?: number;
  name?: string | null;
  product?: ReturnOrderProduct | null;
};

export type ReturnOrderSaleOrderRef = {
  id?: number;
  order_number?: string | null;
};

export type ReturnOrderSellerRef = {
  name?: string | null;
};

/** Phần tử GET /return-orders (include theo query). */
export type ReturnOrderRecord = {
  id: number;
  uuid?: string;
  /** Mã đơn trả (vd. RT-MCT-2600020) */
  return_number?: string | null;
  number?: string | null;
  order_number?: string | null;
  status?: string;
  type?: string | null;
  return_type?: string | null;
  reason?: string | null;
  return_reason?: string | null;
  refund_amount?: string | null;
  total_refund?: string | null;
  refund_status?: string | null;
  sale_order?: ReturnOrderSaleOrderRef | null;
  saleOrder?: ReturnOrderSaleOrderRef | null;
  seller?: ReturnOrderSellerRef | null;
  items?: ReturnOrderLine[] | null;
};

export type ReturnOrdersApiResponse = {
  success: boolean;
  message: string;
  data?: ReturnOrderRecord[];
  meta?: ReturnOrdersListMeta;
};
