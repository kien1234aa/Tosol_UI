/**
 * Vai trò ứng dụng — hiện tại chỉ có 'seller'.
 * Giữ kiểu / hàm để có thể bổ sung role sau nếu cần.
 */
export type AppRole = 'seller';

export function normalizeAppRole(_raw: string | undefined | null): AppRole {
  return 'seller';
}

/**
 * Các pattern role KHÔNG được phép dùng app này.
 * App chỉ dành cho Seller/Staff — Admin/Kế toán/Thủ kho bị chặn.
 */
const BLOCKED_ROLE_PATTERNS: string[] = [
  'admin', 'administrator', 'super admin', 'superadmin',
  'quản trị', 'quan tri', 'tosol admin', 'tosol staff',
  'accountant', 'kế toán', 'ke toan', 'nvkt',
  'warehouse', 'warehouse manager', 'warehouse_manager',
  'quản lý kho', 'quan ly kho', 'thủ kho', 'thu kho',
];

/**
 * Trả về `true` nếu raw role từ API KHÔNG được phép vào app.
 * Dùng để chặn admin / kế toán / thủ kho ở màn hình đầu tiên.
 */
export function isRoleBlockedFromApp(rawRole: string | null | undefined): boolean {
  if (rawRole == null || rawRole.trim() === '') {
    return false;
  }
  const key = rawRole.trim().toLowerCase().replace(/_/g, ' ');
  const primary = key.split(',')[0]?.trim() ?? key;
  return BLOCKED_ROLE_PATTERNS.some(p => primary === p || primary.includes(p));
}

export function isAdminRole(_role: AppRole): boolean {
  return false;
}

export function isAdminOrWarehouseManager(_role: AppRole): boolean {
  return false;
}

export function appRoleLabelVi(_role: AppRole): string {
  return 'Nhà bán';
}
