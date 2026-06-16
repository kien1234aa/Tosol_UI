/** GET `/users` — nhân viên / người dùng trong phạm vi seller (token). */

export type StaffUserRole = 'admin' | 'staff' | string;

export type StaffUserApi = {
  id: number;
  uuid: string;
  seller_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: StaffUserRole;
  is_active: boolean;
  is_tosol_user: boolean;
  is_seller_user: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffUsersListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type StaffUsersApiResponse = {
  success: boolean;
  message: string;
  data?: unknown[];
  meta?: StaffUsersListMeta;
};

/** GET `/users/:id` — có thể kèm `seller`, `warehouses`. */

export type StaffSellerNestedApi = {
  id: number;
  name: string;
};

export type StaffUserDetailApi = StaffUserApi & {
  seller?: StaffSellerNestedApi | null;
  warehouses?: unknown[];
};
