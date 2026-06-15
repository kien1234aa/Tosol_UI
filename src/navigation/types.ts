import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Bottom tab routes shown after login. */
export type MainTabParamList = {
  Search: undefined;
  Cart: undefined;
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
};

/** Nested stack inside the Search tab. */
export type SearchStackParamList = {
  SearchMain: undefined;
  ProductDetail: { productId: string };
};

/** Nested stack inside the Orders tab. */
export type OrdersStackParamList = {
  OrdersMain: undefined;
  OrderDetail: { orderId: string };
};

/** Nested stack inside the Profile tab. */
export type ProfileStackParamList = {
  ProfileMain: undefined;
  PersonalInfo: undefined;
  ChangePassword: undefined;
};

/** Central route registry for the root stack navigator. */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Notifications: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type MainTabScreenProps<RouteName extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, RouteName>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type SearchStackScreenProps<
  RouteName extends keyof SearchStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<SearchStackParamList, RouteName>,
  MainTabScreenProps<'Search'>
>;

export type OrdersStackScreenProps<
  RouteName extends keyof OrdersStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<OrdersStackParamList, RouteName>,
  MainTabScreenProps<'Orders'>
>;

export type ProfileStackScreenProps<
  RouteName extends keyof ProfileStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, RouteName>,
  MainTabScreenProps<'Profile'>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
