import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import type { AppRole } from '../types/appRole';
import {
  SALES_BOTTOM_TAB_ORDER,
  bottomTabToDrawerIdForRole,
  drawerIdToBottomTab,
  type SalesBottomTabId,
} from '@features/sales/navigation/salesBottomTabNav';

const BOTTOM_TAB_LABEL_KEYS_SELLER: Record<SalesBottomTabId, string> = {
  orders: 'nav.tab.seller.orders',
  catalog: 'nav.tab.seller.catalog',
  goods: 'nav.tab.seller.goods',
  finance: 'nav.tab.seller.finance',
};

const BOTTOM_TAB_ICONS_SELLER: Record<SalesBottomTabId, SystemIconName> = {
  orders: 'cart',
  catalog: 'grid',
  goods: 'layers',
  finance: 'wallet',
};

export function bottomNavLabelKeysForRole(
  _role: AppRole,
): Record<SalesBottomTabId, string> {
  return { ...BOTTOM_TAB_LABEL_KEYS_SELLER };
}

/** @deprecated Dùng `bottomNavLabelKeysForRole` + i18n `t` */
export function bottomNavLabelsForRole(
  role: AppRole,
): Record<SalesBottomTabId, string> {
  return bottomNavLabelKeysForRole(role);
}

export function bottomNavIconsForRole(
  _role: AppRole,
): Record<SalesBottomTabId, SystemIconName> {
  return { ...BOTTOM_TAB_ICONS_SELLER };
}

export type SalesBottomNavChromeVariant = 'admin' | 'seller';

export function bottomNavChromeForRole(_role: AppRole): {
  labelKeys: Record<SalesBottomTabId, string>;
  icons: Record<SalesBottomTabId, SystemIconName>;
  variant: SalesBottomNavChromeVariant;
} {
  return {
    labelKeys: { ...BOTTOM_TAB_LABEL_KEYS_SELLER },
    icons: { ...BOTTOM_TAB_ICONS_SELLER },
    variant: 'seller',
  };
}

export function includeShopLinksInSalesNav(_role: AppRole): boolean {
  return true;
}

export function adminShouldLeaveSalesShopDrawer(
  _role: AppRole,
  _drawerActiveId: string,
): boolean {
  return false;
}

export function bottomTabsForAppRole(_role: AppRole): SalesBottomTabId[] {
  return [...SALES_BOTTOM_TAB_ORDER];
}

export function isBottomTabAllowedForRole(
  tab: SalesBottomTabId,
  role: AppRole,
): boolean {
  return bottomTabsForAppRole(role).includes(tab);
}

export function isDrawerNavAllowedForRole(
  _drawerId: string,
  _role: AppRole,
): boolean {
  return true;
}

export function defaultDrawerIdForRole(role: AppRole): string {
  const tabs = bottomTabsForAppRole(role);
  const first = tabs[0] ?? 'orders';
  return bottomTabToDrawerIdForRole(first, role);
}

export {
  coerceDetailActiveTabId,
  customerDetailTabsForAppRole,
  inventoryProductDetailTabsForAppRole,
  invoiceDetailTabsForAppRole,
  inboundOrderDetailTabsForAppRole,
  orderDetailTabsForAppRole,
  outboundOrderDetailTabsForAppRole,
  packingOrderDetailTabsForAppRole,
  productDetailTabsForAppRole,
  purchaseOrderDetailTabsForAppRole,
  settlementDetailTabsForAppRole,
  shopDetailTabsForAppRole,
  supplierDetailTabsForAppRole,
  transferOrderDetailTabsForAppRole,
  comboAssemblyDetailTabsForAppRole,
} from './roleDetailTabPolicy';
