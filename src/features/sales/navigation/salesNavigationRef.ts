import { CommonActions } from '@react-navigation/native';
import {
  drawerIdToBottomTab,
  type SalesBottomTabId,
} from './salesBottomTabNav';
import {
  salesBottomTabRouteName,
  STACK_SCREEN_TO_TAB,
} from './salesBottomTabRoutes';
import {
  getActiveSalesNavTab,
  getTabStackNavigationState,
  jumpToSalesBottomTab,
  salesNavRefForDrawer,
  salesRootNavigationRef,
  setActiveSalesNavTab,
  syncActiveSalesNavTabFromRootState,
} from './salesTabNavRefs';

export {
  salesNavigationRef,
  salesRootNavigationRef,
  setActiveSalesNavTab,
  getActiveSalesNavTab,
  navigateSalesStackScreen,
  jumpToSalesBottomTab,
  syncActiveSalesNavTabFromRootState,
} from './salesTabNavRefs';
import type { NotificationDetailParams } from '../../notifications/notificationDetailParams';

export type SalesMainStackParamList = {
  /** Danh sách thông báo (GET /notifications). */
  NotificationsList: undefined;
  /** Chi tiết nội dung một thông báo (vd. thông báo hệ thống, không có liên kết thực thể). */
  NotificationDetail: NotificationDetailParams;
  /** Trang chủ seller — `GET /dashboard/seller`. */
  SellerDashboard: undefined;
  OrdersAll: undefined;
  /** Đơn hàng theo một cửa hàng — `filter[shop_id]`. */
  ShopOrders: { shopId: number };
  OrdersReturns: undefined;
  Shipments: undefined;
  CategoryProducts: undefined;
  /** Danh mục → Bảng giá. */
  CategoryPriceLists: undefined;
  /** Danh mục → Nhà cung cấp. */
  CategorySuppliers: undefined;
  /** Danh mục → Khách hàng. */
  CategoryCustomers: undefined;
  /** Form tạo khách (stack — ví dụ từ màn tạo đơn). */
  CreateCustomer: { fromCreateOrder?: boolean } | undefined;
  /** Hàng hóa → Tồn kho của tôi. */
  GoodsMyInventory: undefined;
  /** Hàng hóa → Mua hàng. */
  GoodsPurchase: undefined;
  /** Hàng hóa → Đóng gói combo (`/combo-assemblies`). */
  GoodsComboPack: undefined;
  /** Quản lý kho → Cảnh báo tồn kho (`GET /inventory/alerts`). */
  GoodsStockAlerts: undefined;
  /** Quản lý kho → Vị trí kho (`GET /locations`). */
  GoodsLocations: undefined;
  /** Quản lý kho → Sơ đồ rack (`GET /warehouses/{code}/layout/rack-view`). */
  GoodsLayoutMap: undefined;
  /** Tài chính → Hóa đơn. */
  FinanceInvoices: undefined;
  /** Tài chính → Thanh toán. */
  FinancePayments: undefined;
  /** Tài chính → Giao dịch cổng. */
  FinanceGateway: undefined;
  /** Tài chính → Đối soát. */
  FinanceSettlements: undefined;
  /** Tài chính → Bảng giá dịch vụ (`GET /service-pricings`). */
  FinanceServicePricing: undefined;
  /** Cài đặt → Cửa hàng. */
  SettingsShops: undefined;
  /** Cài đặt → Tài khoản ngân hàng. */
  SettingsBankAccounts: undefined;
  /** Cài đặt → Đối tác vận chuyển. */
  SettingsCarriers: undefined;
  /** Cài đặt → Webhooks. */
  SettingsWebhooks: undefined;
  /** Cài đặt → Nhân viên. */
  SettingsStaff: undefined;
};

export type SalesStackRoute =
  | { name: 'ShopOrders'; params: { shopId: number } }
  | {
      name: Exclude<keyof SalesMainStackParamList, 'ShopOrders'>;
    };

const MAX_STACK_DEPTH_BEFORE_RESET = 12;

/** Màn gần nhất theo từng tab bottom — quay lại tab không remount nếu còn trong stack. */
const tabRouteCache: Partial<Record<SalesBottomTabId, SalesStackRoute>> = {};

type StackRouteState = {
  name: string;
  params?: object;
};

function routesMatch(
  a: StackRouteState | undefined,
  b: SalesStackRoute,
): boolean {
  if (!a || a.name !== b.name) {
    return false;
  }
  if (b.name === 'ShopOrders') {
    const ap = a.params as { shopId?: number } | undefined;
    return ap?.shopId === b.params.shopId;
  }
  return true;
}

/** Map drawer id → route stack (dùng chung reset / navigate). */
export function resolveSalesStackRouteForDrawerId(
  drawerId: string,
): SalesStackRoute {
  let route: SalesStackRoute = { name: 'OrdersAll' };
  if (drawerId === 'dashboard') {
    route = { name: 'SellerDashboard' };
  } else if (drawerId === 'sales:orders-all') {
    route = { name: 'OrdersAll' };
  } else if (drawerId === 'sales:returns') {
    route = { name: 'OrdersReturns' };
  } else if (drawerId === 'sales:shipping') {
    route = { name: 'Shipments' };
  } else if (drawerId.startsWith('sales:shop:')) {
    const shopId = parseInt(drawerId.slice('sales:shop:'.length), 10);
    if (Number.isFinite(shopId) && shopId > 0) {
      route = { name: 'ShopOrders', params: { shopId } };
    }
  } else if (drawerId.startsWith('sales:')) {
    route = { name: 'OrdersAll' };
  } else if (drawerId === 'category:products') {
    route = { name: 'CategoryProducts' };
  } else if (drawerId === 'category:prices') {
    route = { name: 'CategoryPriceLists' };
  } else if (drawerId === 'category:suppliers') {
    route = { name: 'CategorySuppliers' };
  } else if (drawerId === 'category:customers') {
    route = { name: 'CategoryCustomers' };
  } else if (drawerId === 'goods:my-inventory') {
    route = { name: 'GoodsMyInventory' };
  } else if (drawerId === 'goods:purchase') {
    route = { name: 'GoodsPurchase' };
  } else if (drawerId === 'goods:combo-pack') {
    route = { name: 'GoodsComboPack' };
  } else if (drawerId === 'goods:stock-alerts') {
    route = { name: 'GoodsStockAlerts' };
  } else if (drawerId === 'goods:locations') {
    route = { name: 'GoodsLocations' };
  } else if (drawerId === 'goods:layout-map') {
    route = { name: 'GoodsLayoutMap' };
  } else if (drawerId === 'finance:invoices') {
    route = { name: 'FinanceInvoices' };
  } else if (drawerId === 'finance:payments') {
    route = { name: 'FinancePayments' };
  } else if (drawerId === 'finance:gateway') {
    route = { name: 'FinanceGateway' };
  } else if (drawerId === 'finance:settlements') {
    route = { name: 'FinanceSettlements' };
  } else if (drawerId === 'finance:service-pricing') {
    route = { name: 'FinanceServicePricing' };
  } else if (drawerId.startsWith('finance:')) {
    route = { name: 'FinanceInvoices' };
  } else if (drawerId === 'settings:shops') {
    route = { name: 'SettingsShops' };
  } else if (drawerId === 'settings:bank-accounts') {
    route = { name: 'SettingsBankAccounts' };
  } else if (drawerId === 'settings:carriers') {
    route = { name: 'SettingsCarriers' };
  } else if (drawerId === 'settings:webhooks') {
    route = { name: 'SettingsWebhooks' };
  } else if (drawerId === 'settings:staff') {
    route = { name: 'SettingsStaff' };
  } else if (drawerId.startsWith('settings:')) {
    route = { name: 'SettingsShops' };
  }
  return route;
}

export function getActiveSalesStackRoute(
  tab: SalesBottomTabId = getActiveSalesNavTab(),
): SalesStackRoute | null {
  const state = getTabStackNavigationState(tab);
  if (!state || state.routes.length === 0) {
    return null;
  }
  const route = state.routes[state.index] as StackRouteState;
  if (route.name === 'ShopOrders') {
    const shopId = (route.params as { shopId?: number } | undefined)?.shopId;
    if (shopId == null || !Number.isFinite(shopId)) {
      return null;
    }
    return { name: 'ShopOrders', params: { shopId } };
  }
  return {
    name: route.name as Exclude<keyof SalesMainStackParamList, 'ShopOrders'>,
  };
}

export function cacheSalesTabRoute(
  tab: SalesBottomTabId,
  route: SalesStackRoute,
): void {
  tabRouteCache[tab] = route;
}

function rememberTabRouteForDrawer(drawerId: string): void {
  const tab = drawerIdToBottomTab(drawerId);
  if (tab) {
    tabRouteCache[tab] = resolveSalesStackRouteForDrawerId(drawerId);
  }
}

function nestedStackRouteState(route: SalesStackRoute): StackRouteState {
  if (route.name === 'ShopOrders') {
    return { name: 'ShopOrders', params: route.params };
  }
  return { name: route.name };
}

function buildNestedStackResetState(route: SalesStackRoute) {
  return {
    index: 0,
    routes: [nestedStackRouteState(route)],
  };
}

function dispatchNestedStackReset(
  tab: SalesBottomTabId,
  route: SalesStackRoute,
): void {
  if (!salesRootNavigationRef.isReady()) {
    return;
  }
  const tabRouteName = salesBottomTabRouteName(tab);
  const root = salesRootNavigationRef.getRootState();
  const tabIndex = root.routes.findIndex(r => r.name === tabRouteName);
  const routes = root.routes.map(r => {
    if (r.name === tabRouteName) {
      return {
        name: tabRouteName,
        state: buildNestedStackResetState(route),
      };
    }
    return r;
  });

  salesRootNavigationRef.dispatch(
    CommonActions.reset({
      index: tabIndex >= 0 ? tabIndex : root.index,
      routes,
    } as never),
  );
}

function dispatchNestedStackNavigate(
  tab: SalesBottomTabId,
  route: SalesStackRoute,
): void {
  if (!salesRootNavigationRef.isReady()) {
    return;
  }
  const tabRouteName = salesBottomTabRouteName(tab);
  const stackState = getTabStackNavigationState(tab);
  if (!stackState) {
    dispatchNestedStackReset(tab, route);
    return;
  }

  const routes = stackState.routes as StackRouteState[];
  const index = stackState.index ?? routes.length - 1;
  const current = routes[index];

  if (routesMatch(current, route)) {
    jumpToSalesBottomTab(tab);
    return;
  }

  const existingIndex = routes.findIndex(r => routesMatch(r, route));
  if (existingIndex >= 0 && existingIndex < index) {
    jumpToSalesBottomTab(tab);
    if (route.name === 'ShopOrders') {
      salesRootNavigationRef.navigate(tabRouteName as 'SalesTabOrders', {
        screen: 'ShopOrders',
        params: route.params,
      });
      return;
    }
    salesRootNavigationRef.navigate(
      tabRouteName,
      { screen: route.name } as never,
    );
    return;
  }

  jumpToSalesBottomTab(tab);
  if (route.name === 'ShopOrders') {
    salesRootNavigationRef.navigate(tabRouteName as 'SalesTabOrders', {
      screen: 'ShopOrders',
      params: route.params,
    });
    return;
  }
  salesRootNavigationRef.navigate(
    tabRouteName,
    { screen: route.name } as never,
  );
}

function runWhenRootNavReady(run: () => void): void {
  if (salesRootNavigationRef.isReady()) {
    run();
    return;
  }
  requestAnimationFrame(() => {
    if (salesRootNavigationRef.isReady()) {
      run();
    }
  });
}

/**
 * Chuyển tab bottom: ưu tiên navigate / pop trong stack tab (giữ state),
 * chỉ reset khi stack quá sâu.
 */
export function navigateSalesStackForBottomTab(
  tab: SalesBottomTabId,
  defaultDrawerId: string,
): void {
  const fallbackRoute = resolveSalesStackRouteForDrawerId(defaultDrawerId);
  const targetRoute = tabRouteCache[tab] ?? fallbackRoute;

  runWhenRootNavReady(() => {
    if (!salesRootNavigationRef.isReady()) {
      return;
    }
    const stackState = getTabStackNavigationState(tab);
    const depth = stackState?.routes.length ?? 0;
    if (depth > MAX_STACK_DEPTH_BEFORE_RESET) {
      dispatchNestedStackReset(tab, targetRoute);
      return;
    }
    dispatchNestedStackNavigate(tab, targetRoute);
  });
}

/**
 * Đồng bộ stack với mục menu / dropdown (reset — tránh stack lẫn nhóm).
 */
export function resetSalesStackForDrawerId(drawerId: string): void {
  const route = resolveSalesStackRouteForDrawerId(drawerId);
  rememberTabRouteForDrawer(drawerId);
  const tab =
    drawerIdToBottomTab(drawerId) ?? STACK_SCREEN_TO_TAB[route.name] ?? 'orders';

  runWhenRootNavReady(() => {
    jumpToSalesBottomTab(tab);
    dispatchNestedStackReset(tab, route);
  });
}
