import { TabActions } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { MainTabParamList } from './types';

const MAIN_TAB_ROUTE_NAMES = new Set<keyof MainTabParamList>([
  'Search',
  'CreateOrder',
  'Home',
  'Orders',
  'Profile',
]);

/**
 * Chiến lược điều hướng tab (chuẩn app doanh nghiệp / B2B):
 *
 * - **hub**: Home, Search, Profile — điểm vào, luôn về màn gốc khi chuyển tab tới.
 * - **workflow**: Orders, CreateOrder — giữ stack khi đổi tab tạm; chỉ về gốc khi bấm lại tab đó.
 */
export type MainTabNavigationKind = 'hub' | 'workflow';

export const mainTabRootScreens: {
  [K in keyof MainTabParamList]: string;
} = {
  Search: 'SearchMain',
  CreateOrder: 'CreateOrderList',
  Home: 'HomeMain',
  Orders: 'OrdersMain',
  Profile: 'ProfileMain',
};

export const mainTabNavigationKind: {
  [K in keyof MainTabParamList]: MainTabNavigationKind;
} = {
  Search: 'hub',
  Home: 'hub',
  Profile: 'hub',
  Orders: 'workflow',
  CreateOrder: 'workflow',
};

export function shouldPopTabStackOnBlur(
  tabRouteName: keyof MainTabParamList,
): boolean {
  return mainTabNavigationKind[tabRouteName] === 'hub';
}

/** Bottom-tab navigator (parent of each tab stack). */
export function getMainTabNavigation(
  navigation: NavigationProp<ParamListBase>,
): NavigationProp<ParamListBase> {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const state = current.getState();
    const routeNames: string[] =
      state.routeNames ?? state.routes.map(route => route.name);
    const mainTabMatches = routeNames.filter(name =>
      MAIN_TAB_ROUTE_NAMES.has(name as keyof MainTabParamList),
    ).length;

    if (mainTabMatches >= 3) {
      return current;
    }

    current = current.getParent() as NavigationProp<ParamListBase> | undefined;
  }

  return navigation.getParent() ?? navigation;
}

export function getMainTabNestedStackIndex(
  navigation: NavigationProp<ParamListBase>,
  tabRouteName: string,
): number {
  const tabState = getMainTabNavigation(navigation).getState();
  const targetTab = tabState.routes.find(route => route.name === tabRouteName);
  const nestedState = targetTab?.state;

  if (!nestedState || nestedState.index == null) {
    return 0;
  }

  return nestedState.index;
}

export function isMainTabRouteFocused(
  navigation: NavigationProp<ParamListBase>,
  tabRouteName: string,
): boolean {
  const tabState = getMainTabNavigation(navigation).getState();
  return tabState.routes[tabState.index]?.name === tabRouteName;
}

/**
 * Bấm lại tab đang active khi đang ở màn con → về màn gốc.
 * Chuyển sang tab hub khác: để default tab bar chuyển tab; `popToTopOnBlur` đã reset stack khi rời tab.
 */
export function shouldPopTabToRootOnRepress(
  isFocused: boolean,
  nestedStackIndex: number,
): boolean {
  return isFocused && nestedStackIndex > 0;
}

export function navigateMainTabToRoot(
  navigation: NavigationProp<ParamListBase>,
  tabRouteName: keyof MainTabParamList,
): void {
  const tabNavigation = getMainTabNavigation(navigation);
  const rootScreen = mainTabRootScreens[tabRouteName];

  tabNavigation.navigate(
    tabRouteName as never,
    { screen: rootScreen } as never,
  );
}

/** Chuyển sang tab khác (workflow — giữ nguyên stack đã lưu). */
export function switchMainTab(
  navigation: NavigationProp<ParamListBase>,
  tabRouteName: keyof MainTabParamList,
): void {
  getMainTabNavigation(navigation).dispatch(
    TabActions.jumpTo(tabRouteName),
  );
}

/** Điều hướng chéo tab từ stack con (vd. Home dashboard). */
export function navigateMainTabScreen(
  navigation: NavigationProp<ParamListBase>,
  tabRouteName: keyof MainTabParamList,
  nested?: { screen: string; params?: object },
): void {
  const tabNavigation = getMainTabNavigation(navigation);

  if (!nested) {
    if (mainTabNavigationKind[tabRouteName] === 'hub') {
      navigateMainTabToRoot(navigation, tabRouteName);
    } else {
      switchMainTab(navigation, tabRouteName);
    }
    return;
  }

  tabNavigation.navigate(
    tabRouteName as never,
    (nested.params != null
      ? { screen: nested.screen, params: nested.params }
      : { screen: nested.screen }) as never,
  );
}
