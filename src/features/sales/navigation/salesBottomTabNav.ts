import type { AppRole } from '@features/auth/types/appRole';

/** Tab dưới cùng (thứ tự: Bán hàng — Danh mục — Hàng hóa — Tài chính). */
export type SalesBottomTabId =
  | 'orders'
  | 'catalog'
  | 'goods'
  | 'finance';

export const SALES_BOTTOM_TAB_ORDER: SalesBottomTabId[] = [
  'orders',
  'catalog',
  'goods',
  'finance',
];

const TAB_TO_DRAWER: Record<SalesBottomTabId, string> = {
  orders: 'sales:orders-all',
  catalog: 'category:products',
  goods: 'goods:my-inventory',
  finance: 'finance:invoices',
};

export function drawerIdToBottomTab(drawerId: string): SalesBottomTabId | null {
  if (drawerId.startsWith('sales:')) {
    return 'orders';
  }
  if (drawerId.startsWith('category:')) {
    return 'catalog';
  }
  if (drawerId.startsWith('goods:')) {
    return 'goods';
  }
  if (drawerId.startsWith('finance:')) {
    return 'finance';
  }
  if (drawerId === 'dashboard') {
    return 'orders';
  }
  if (drawerId.startsWith('settings:')) {
    return null;
  }
  return null;
}

export function bottomTabToDrawerId(tab: SalesBottomTabId): string {
  return TAB_TO_DRAWER[tab];
}

export function bottomTabToDrawerIdForRole(
  tab: SalesBottomTabId,
  _role: AppRole,
): string {
  return TAB_TO_DRAWER[tab];
}
