/** Domain models for the authentication feature. */

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthSeller {
  id: number;
  uuid: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  tax_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthWarehouse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  address: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  phone: string;
  email: string | null;
  is_active: boolean;
  location_management_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  uuid: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  isTosolUser: boolean;
  isSellerUser: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  seller: AuthSeller | null;
  warehouses: AuthWarehouse[];
  currentWarehouseId: number | null;
  hasMultipleWarehouses: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  tokenType: string;
  expiresIn: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

/** Raw API response shapes (snake_case). */

export interface LoginApiUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  is_tosol_user: boolean;
  is_seller_user: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  seller: AuthSeller | null;
  warehouses: AuthWarehouse[];
  current_warehouse_id: number | null;
  has_multiple_warehouses: boolean;
}

export interface LoginApiData {
  user: LoginApiUser;
  token: string;
  token_type: string;
  expires_in: number;
}
