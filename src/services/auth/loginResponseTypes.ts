/**
 * Types matching POST /login success JSON from TOSOL API.
 */

export type LoginSeller = {
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
};

export type LoginWarehouse = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  location_management_enabled: boolean;
  created_at: string;
  updated_at: string;
};

/** `data.user` in a successful login response */
export type LoginUser = {
  uuid: string;
  name: string;
  email: string;
  /** Vai trò nghiệp vụ (vd. admin, seller, kế toán…) — dùng `normalizeAppRole()` khi phân quyền UI. */
  role: string;
  is_tosol_user: boolean;
  is_seller_user: boolean;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  seller: LoginSeller | null;
  warehouses: LoginWarehouse[];
  current_warehouse_id: number | null;
  has_multiple_warehouses: boolean;
};

/** `data` object when `success === true` */
export type LoginSuccessData = {
  user: LoginUser;
  token: string;
  token_type: string;
  expires_in: number;
};

/** Top-level login API envelope */
export type LoginApiResponse = {
  success: boolean;
  message: string;
  data?: LoginSuccessData;
};
