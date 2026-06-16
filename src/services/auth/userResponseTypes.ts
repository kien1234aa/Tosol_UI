import { LoginSeller, LoginWarehouse } from './loginResponseTypes';

export type UserInfo = {
  uuid: string;
  name: string;
  email: string;
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

/** Top-level GET `/me` */
export type MeApiResponse = {
  success: boolean;
  message: string;
  data?: UserInfo;
};
