import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import type { MainTabParamList } from './types';

/** Nested routes that hide the bottom tab bar. */
export const mainTabBarHiddenRoutes: {
  [K in keyof MainTabParamList]?: string[];
} = {
  Search: ['ProductDetail'],
  CreateOrder: ['CreateOrderEdit'],
  Orders: ['OrderDetail'],
  Profile: [
    'PersonalInfo',
    'StaffList',
    'StaffDetail',
    'ProductList',
    'ProductDetail',
    'EditProduct',
    'CreateProduct',
  ],
};

export function isMainTabBarVisibleForRoute(
  route: RouteProp<ParamListBase, string>,
): boolean {
  const tabName = route.name as keyof MainTabParamList;
  const focusedRoute = getFocusedRouteNameFromRoute(route);
  const hiddenRoutes = mainTabBarHiddenRoutes[tabName];

  if (!focusedRoute || !hiddenRoutes?.length) {
    return true;
  }

  return !hiddenRoutes.includes(focusedRoute);
}
