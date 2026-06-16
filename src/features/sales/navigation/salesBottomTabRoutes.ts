import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SalesBottomTabId } from './salesBottomTabNav';
import type { SalesMainStackParamList } from './salesNavigationRef';

/** Tên screen tab trong `createBottomTabNavigator` (một `NavigationContainer`). */
export const SALES_BOTTOM_TAB_ROUTE_NAMES = {
  orders: 'SalesTabOrders',
  catalog: 'SalesTabCatalog',
  goods: 'SalesTabGoods',
  finance: 'SalesTabFinance',
} as const satisfies Record<SalesBottomTabId, string>;

export type SalesBottomTabRouteName =
  (typeof SALES_BOTTOM_TAB_ROUTE_NAMES)[SalesBottomTabId];

export type SalesBottomTabParamList = {
  SalesTabOrders: NavigatorScreenParams<SalesMainStackParamList>;
  SalesTabCatalog: NavigatorScreenParams<SalesMainStackParamList>;
  SalesTabGoods: NavigatorScreenParams<SalesMainStackParamList>;
  SalesTabFinance: NavigatorScreenParams<SalesMainStackParamList>;
};

export function salesBottomTabRouteName(
  tab: SalesBottomTabId,
): SalesBottomTabRouteName {
  return SALES_BOTTOM_TAB_ROUTE_NAMES[tab];
}

export function bottomTabIdFromRouteName(
  name: string,
): SalesBottomTabId | null {
  const entry = (
    Object.entries(SALES_BOTTOM_TAB_ROUTE_NAMES) as [
      SalesBottomTabId,
      string,
    ][]
  ).find(([, routeName]) => routeName === name);
  return entry?.[0] ?? null;
}

/** Màn stack → tab chứa màn đó (màn chỉ có trên một tab). */
export const STACK_SCREEN_TO_TAB: Partial<
  Record<keyof SalesMainStackParamList, SalesBottomTabId>
> = {
  /** Chỉ khai báo trên stack tab Đơn hàng — luôn chuyển tab trước khi mở. */
  NotificationsList: 'orders',
  NotificationDetail: 'orders',
  SellerDashboard: 'orders',
  OrdersAll: 'orders',
  ShopOrders: 'orders',
  OrdersReturns: 'orders',
  Shipments: 'orders',
  SettingsShops: 'orders',
  SettingsBankAccounts: 'orders',
  SettingsCarriers: 'orders',
  SettingsWebhooks: 'orders',
  SettingsStaff: 'orders',
  CategoryProducts: 'catalog',
  CategoryPriceLists: 'catalog',
  CategorySuppliers: 'catalog',
  CategoryCustomers: 'catalog',
  CreateCustomer: 'catalog',
  GoodsMyInventory: 'goods',
  GoodsPurchase: 'goods',
  GoodsComboPack: 'goods',
  GoodsStockAlerts: 'goods',
  GoodsLocations: 'goods',
  GoodsLayoutMap: 'goods',
  FinanceInvoices: 'finance',
  FinancePayments: 'finance',
  FinanceGateway: 'finance',
  FinanceSettlements: 'finance',
  FinanceServicePricing: 'finance',
};
