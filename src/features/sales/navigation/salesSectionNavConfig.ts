/**
 * Cấu hình điều hướng nhóm (thay cho drawer) — đồng bộ id với `resetSalesStackForDrawerId`.
 * Nhãn tĩnh dùng `labelKey` (i18n); cửa hàng động dùng `label` (tên hiển thị).
 */

import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import type { AppRole } from '@features/auth/types/appRole';
import { includeShopLinksInSalesNav } from '@features/auth/utils/roleNavPolicy';

export type SectionNavItem = {
  drawerId: string;
  /** Khóa i18n khi nhãn cố định */
  labelKey?: string;
  /** Nhãn hiển thị thô (vd. tên cửa hàng) — ưu tiên khi có */
  label?: string;
  /** `sales:shop:*` không có tên — dùng với `labelKey` `nav.drawer.shopNamed` */
  shopId?: number;
};

export type SalesSectionChromeNavModel = {
  groupTitleKey: string;
  options: SectionNavItem[];
};

export const DASHBOARD_NAV_ITEMS: SectionNavItem[] = [
  { drawerId: 'dashboard', labelKey: 'nav.drawer.dashboard' },
];

export const SALES_CORE_NAV_ITEMS: SectionNavItem[] = [
  { drawerId: 'sales:orders-all', labelKey: 'nav.drawer.orders' },
  { drawerId: 'sales:shipping', labelKey: 'nav.drawer.shipping' },
  { drawerId: 'sales:returns', labelKey: 'nav.drawer.returns' },
];

export const CATEGORY_NAV_ITEMS: SectionNavItem[] = [
  { drawerId: 'category:products', labelKey: 'nav.drawer.products' },
  { drawerId: 'category:prices', labelKey: 'nav.drawer.priceLists' },
  { drawerId: 'category:suppliers', labelKey: 'nav.drawer.suppliers' },
  { drawerId: 'category:customers', labelKey: 'nav.drawer.customers' },
];

export function categorySectionNavForAppRole(_role: AppRole): SectionNavItem[] {
  return [...CATEGORY_NAV_ITEMS];
}

export const GOODS_NAV_ITEMS_SELLER: SectionNavItem[] = [
  { drawerId: 'goods:my-inventory', labelKey: 'nav.drawer.myInventorySeller' },
  { drawerId: 'goods:purchase', labelKey: 'nav.drawer.purchase' },
  { drawerId: 'goods:combo-pack', labelKey: 'nav.drawer.comboPack' },
];

export function goodsSectionNavForAppRole(_role: AppRole): SectionNavItem[] {
  return [...GOODS_NAV_ITEMS_SELLER];
}

export function goodsSectionGroupTitleKeyForAppRole(_role: AppRole): string {
  return 'nav.group.goodsSeller';
}

export const FINANCE_NAV_ITEMS_SELLER: SectionNavItem[] = [
  { drawerId: 'finance:invoices', labelKey: 'nav.drawer.invoices' },
  { drawerId: 'finance:settlements', labelKey: 'nav.drawer.settlements' },
  { drawerId: 'finance:payments', labelKey: 'nav.drawer.payments' },
  { drawerId: 'finance:gateway', labelKey: 'nav.drawer.gatewaySeller' },
  { drawerId: 'finance:service-pricing', labelKey: 'nav.drawer.servicePricing' },
];

export function financeSectionNavForAppRole(_role: AppRole): SectionNavItem[] {
  return [...FINANCE_NAV_ITEMS_SELLER];
}

export const SETTINGS_NAV_ITEMS: SectionNavItem[] = [
  { drawerId: 'settings:shops', labelKey: 'nav.drawer.shops' },
  { drawerId: 'settings:bank-accounts', labelKey: 'nav.drawer.bankAccounts' },
  { drawerId: 'settings:carriers', labelKey: 'nav.drawer.carriers' },
  { drawerId: 'settings:webhooks', labelKey: 'nav.drawer.webhooks' },
  { drawerId: 'settings:staff', labelKey: 'nav.drawer.staff' },
];

export function settingsSectionNavForAppRole(_role: AppRole): SectionNavItem[] {
  return [...SETTINGS_NAV_ITEMS];
}

export type AdminAvatarNavAccordion = {
  key: string;
  titleKey: string;
  icon: SystemIconName;
  items: SectionNavItem[];
};

/** Chuỗi hiển thị một mục menu (ưu `label` động, không thì dịch `labelKey`). */
export function resolveSectionNavItemLabel(
  item: SectionNavItem,
  t: (key: string, opts?: Record<string, string | number>) => string,
): string {
  if (item.label != null && item.label.trim().length > 0) {
    return item.label.trim();
  }
  if (item.labelKey) {
    if (item.shopId != null) {
      return t(item.labelKey, { id: item.shopId });
    }
    return t(item.labelKey);
  }
  return '';
}

export function getSalesSectionChromeNavModel(
  activeDrawerId: string,
  menuShops: { id: number; name: string }[],
  appRole: AppRole,
): SalesSectionChromeNavModel | null {
  if (activeDrawerId.startsWith('settings:')) {
    return null;
  }
  if (activeDrawerId.startsWith('category:')) {
    return {
      groupTitleKey: 'nav.group.category',
      options: categorySectionNavForAppRole(appRole),
    };
  }
  if (activeDrawerId.startsWith('goods:')) {
    return {
      groupTitleKey: goodsSectionGroupTitleKeyForAppRole(appRole),
      options: goodsSectionNavForAppRole(appRole),
    };
  }
  if (activeDrawerId.startsWith('finance:')) {
    return {
      groupTitleKey: 'nav.group.finance',
      options: financeSectionNavForAppRole(appRole),
    };
  }
  if (activeDrawerId.startsWith('sales:')) {
    const shopOptions: SectionNavItem[] = includeShopLinksInSalesNav(appRole)
      ? menuShops.map(s => {
          const name = s.name?.trim();
          if (name && name.length > 0) {
            return { drawerId: `sales:shop:${s.id}`, label: name };
          }
          return {
            drawerId: `sales:shop:${s.id}`,
            labelKey: 'nav.drawer.shopNamed',
            shopId: s.id,
          };
        })
      : [];
    return {
      groupTitleKey: 'nav.group.sales',
      options: [...SALES_CORE_NAV_ITEMS, ...shopOptions],
    };
  }
  if (activeDrawerId === 'dashboard') {
    return { groupTitleKey: 'nav.group.home', options: DASHBOARD_NAV_ITEMS };
  }
  return null;
}

export function activeSectionNavButtonLabel(
  nav: SalesSectionChromeNavModel | null,
  activeDrawerId: string,
  t: (key: string, opts?: Record<string, string | number>) => string,
): string | null {
  if (nav == null) {
    return null;
  }
  const hit = nav.options.find(x => x.drawerId === activeDrawerId);
  if (hit) {
    return resolveSectionNavItemLabel(hit, t);
  }
  if (activeDrawerId.startsWith('sales:shop:')) {
    const id = Number(activeDrawerId.replace('sales:shop:', ''));
    const shop = nav.options.find(
      o => o.drawerId === `sales:shop:${id}` || o.drawerId === activeDrawerId,
    );
    if (shop) {
      return resolveSectionNavItemLabel(shop, t);
    }
    return t('nav.drawer.shopFallback');
  }
  return t(nav.groupTitleKey);
}

/** Kiểu đã dịch — dùng trong context sau khi map `t`. */
export type SalesSectionChromeNav = {
  groupTitle: string;
  options: { drawerId: string; label: string }[];
};

export function translateSalesSectionChromeNav(
  model: SalesSectionChromeNavModel,
  t: (key: string, opts?: Record<string, string | number>) => string,
): SalesSectionChromeNav {
  return {
    groupTitle: t(model.groupTitleKey),
    options: model.options.map(o => ({
      drawerId: o.drawerId,
      label: resolveSectionNavItemLabel(o, t),
    })),
  };
}
