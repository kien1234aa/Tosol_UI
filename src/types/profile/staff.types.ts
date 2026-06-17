/** Staff list item from GET /users. */

export interface StaffApiItem {
  id: number;
  uuid: string;
  seller_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_tosol_user: boolean;
  is_seller_user: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffListItem {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface StaffListParams {
  page?: number;
  perPage?: number;
}

export interface StaffDetailItem {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  isTosolUser: boolean;
  isSellerUser: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  sellerName: string;
  sellerPhone: string;
  warehouseCount: number;
}

export interface UpdateStaffPayload {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff';
}

export interface ChangeStaffPasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
