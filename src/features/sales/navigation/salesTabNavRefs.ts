import {
  createNavigationContainerRef,
  type NavigationContainerRefWithCurrent,
  type NavigationState,
} from '@react-navigation/native';
import {
  drawerIdToBottomTab,
  type SalesBottomTabId,
} from './salesBottomTabNav';
import {
  bottomTabIdFromRouteName,
  salesBottomTabRouteName,
  STACK_SCREEN_TO_TAB,
  type SalesBottomTabParamList,
} from './salesBottomTabRoutes';
import type { SalesMainStackParamList } from './salesNavigationRef';

/** Một `NavigationContainer` — bottom tabs + stack con. */
export const salesRootNavigationRef =
  createNavigationContainerRef<SalesBottomTabParamList>();

/** @deprecated Dùng `salesRootNavigationRef` + nested navigate. Giữ export để tránh break import. */
export const salesTabNavRefs = {
  orders: salesRootNavigationRef,
  catalog: salesRootNavigationRef,
  goods: salesRootNavigationRef,
  finance: salesRootNavigationRef,
} as const;

let activeSalesNavTab: SalesBottomTabId = 'orders';

export function setActiveSalesNavTab(tab: SalesBottomTabId): void {
  activeSalesNavTab = tab;
}

export function getActiveSalesNavTab(): SalesBottomTabId {
  return activeSalesNavTab;
}

export function syncActiveSalesNavTabFromRootState(): void {
  if (!salesRootNavigationRef.isReady()) {
    return;
  }
  const root = salesRootNavigationRef.getRootState();
  const activeRoute = root.routes[root.index];
  const tab = bottomTabIdFromRouteName(activeRoute?.name ?? '');
  if (tab) {
    activeSalesNavTab = tab;
  }
}

export function getTabStackNavigationState(
  tab: SalesBottomTabId,
): NavigationState | null {
  if (!salesRootNavigationRef.isReady()) {
    return null;
  }
  const tabRouteName = salesBottomTabRouteName(tab);
  const root = salesRootNavigationRef.getRootState();
  const tabRoute = root.routes.find(r => r.name === tabRouteName);
  const state = tabRoute?.state;
  if (state && 'routes' in state) {
    return state as NavigationState;
  }
  return null;
}

/** Stack tương ứng `drawerId` — `settings:*` dùng tab dashboard. */
export function salesNavRefForDrawer(
  drawerId: string,
): NavigationContainerRefWithCurrent<SalesBottomTabParamList> {
  return salesRootNavigationRef;
}

/** Alias — `goBack` / `canGoBack` hoạt động trên stack lồng. */
export const salesNavigationRef = salesRootNavigationRef;

export function navigateSalesStackScreen(
  name: keyof SalesMainStackParamList,
  params?: SalesMainStackParamList[keyof SalesMainStackParamList],
  explicitTab?: SalesBottomTabId,
): void {
  const tab =
    explicitTab ??
    STACK_SCREEN_TO_TAB[name as keyof typeof STACK_SCREEN_TO_TAB] ??
    activeSalesNavTab;
  const tabRoute = salesBottomTabRouteName(tab);

  const run = () => {
    if (!salesRootNavigationRef.isReady()) {
      return;
    }
    setActiveSalesNavTab(tab);
    if (params !== undefined) {
      salesRootNavigationRef.navigate(tabRoute, {
        screen: name,
        params,
      } as never);
      return;
    }
    salesRootNavigationRef.navigate(tabRoute, { screen: name } as never);
  };

  if (salesRootNavigationRef.isReady()) {
    run();
    return;
  }
  requestAnimationFrame(run);
}

export function jumpToSalesBottomTab(tab: SalesBottomTabId): void {
  setActiveSalesNavTab(tab);
  const tabRoute = salesBottomTabRouteName(tab);
  const run = () => {
    if (salesRootNavigationRef.isReady()) {
      (salesRootNavigationRef.navigate as (name: string) => void)(tabRoute);
    }
  };
  if (salesRootNavigationRef.isReady()) {
    run();
    return;
  }
  requestAnimationFrame(run);
}

export function drawerTabForNavigation(drawerId: string): SalesBottomTabId {
  return drawerIdToBottomTab(drawerId) ?? 'orders';
}
