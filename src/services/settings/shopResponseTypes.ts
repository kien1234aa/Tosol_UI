/** Seller kèm GET `/shops/:id` (khi API include). */
export type ShopSellerNested = {
  id: number;
  uuid?: string;
  code?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ShopListItem = {
  id: number;
  uuid: string;
  seller_id: number;
  name: string;
  platform: string;
  platform_shop_id: string | null;
  pick_strategy: string;
  default_payment_method: string;
  online_payment_method: string | null;
  seller_payment_gateway_id: number | null;
  default_bank_account_id: number | null;
  default_shipping_partner_seller_id: number | null;
  currency_id: number;
  default_price_list_id: number | null;
  /** API có thể trả `null` ngay sau khi tạo. */
  is_active: boolean | null;
  auto_sync: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Chi tiết shop — mở rộng từ danh sách, có thể kèm `seller`. */
export type ShopDetailApi = ShopListItem & {
  seller?: ShopSellerNested | null;
};

/** `meta` phân trang Laravel-style */
export type ShopListPaginationMeta = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

/** Body JSON top-level của API danh sách shop */
export type ShopListApiResponse = {
  success: boolean;
  message: string;
  data?: ShopListItem[];
  meta?: ShopListPaginationMeta;
};

export type ShopDetailApiResponse = {
  success: boolean;
  message: string;
  data?: ShopDetailApi;
};
