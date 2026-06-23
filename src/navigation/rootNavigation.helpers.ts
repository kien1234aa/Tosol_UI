import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { RootStackParamList } from './types';

const ROOT_ROUTE_NAMES = new Set<keyof RootStackParamList>([
  'Splash',
  'Login',
  'Register',
  'ForgotPassword',
  'Main',
  'Notifications',
]);

/** Root stack navigator (Splash / Login / Main tabs / Notifications). */
export function getRootNavigation(
  navigation: NavigationProp<ParamListBase>,
): NavigationProp<ParamListBase> {
  let current: NavigationProp<ParamListBase> | undefined = navigation;
  let fallback = navigation;

  while (current) {
    fallback = current;
    const state = current.getState();
    const routeNames: string[] =
      state.routeNames ?? state.routes.map(route => route.name);
    const matches = routeNames.filter(name =>
      ROOT_ROUTE_NAMES.has(name as keyof RootStackParamList),
    ).length;

    if (matches >= 2) {
      return current;
    }

    current = current.getParent() as NavigationProp<ParamListBase> | undefined;
  }

  return fallback;
}

export function navigateRootScreen<RouteName extends keyof RootStackParamList>(
  navigation: NavigationProp<ParamListBase>,
  screen: RouteName,
  params?: RootStackParamList[RouteName],
): void {
  getRootNavigation(navigation).navigate(screen as never, params as never);
}
