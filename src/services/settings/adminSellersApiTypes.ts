/** Meta phân trang — GET `/sellers`. */
export type AdminSellersListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

/** Phần tử `data[]` — GET `/sellers`. */
export type SellerListItemApi = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users_count: number;
  products_count: number;
  shops_count: number;
  warehouses_count: number;
};

export type SellersListApiResponse = {
  success: boolean;
  message: string;
  data?: SellerListItemApi[];
  meta?: AdminSellersListMeta;
};

/** GET `/sellers/{code}` — cùng shape hàng danh sách + đủ trường hiển thị chi tiết. */
export type SellerDetailApi = SellerListItemApi;

export type SellerDetailApiResponse = {
  success: boolean;
  message?: string;
  data?: SellerDetailApi;
};
