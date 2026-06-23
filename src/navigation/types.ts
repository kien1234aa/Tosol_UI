import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Nested stack inside the Create Order tab. */
export type CreateOrderStackParamList = {
  CreateOrderList: undefined;
  CreateOrderEdit: { draftId: string };
};

/** Bottom tab routes shown after login. */
export type MainTabParamList = {
  Search: NavigatorScreenParams<SearchStackParamList> | undefined;
  CreateOrder: NavigatorScreenParams<CreateOrderStackParamList> | undefined;
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Orders: NavigatorScreenParams<OrdersStackParamList> | undefined;
  Profile: undefined;
};

/** Nested stack inside the Home tab. */
export type HomeStackParamList = {
  HomeMain: undefined;
  AwaitingPayment: undefined;
  CreateConsignment: undefined;
  ConsignmentList: undefined;
  ConsignmentDetail: { orderId: string };
  DeliveredConsignment: undefined;
  Wallet: undefined;
  Estimate: undefined;
};

/** Nested stack inside the Search tab. */
export type SearchStackParamList = {
  SearchMain: undefined;
  ProductDetail: { productId: string };
};

/** Nested stack inside the Orders tab. */
export type OrdersStackParamList = {
  OrdersMain: { status?: string } | undefined;
  OrderDetail: { orderId: string };
  DeliveredOrders: undefined;
};

/** Nested stack inside the Profile tab. */
export type ProfileStackParamList = {
  ProfileMain: undefined;
  PersonalInfo: undefined;
  ChangePassword: undefined;
  StaffList: undefined;
  StaffDetail: { staffUuid: string };
  ProductList: undefined;
  CreateProduct: undefined;
  EditProduct: { productId: string };
  ProductDetail: { productId: string };
};

/** Central route registry for the root stack navigator. */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
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

export type CreateOrderStackScreenProps<
  RouteName extends keyof CreateOrderStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<CreateOrderStackParamList, RouteName>,
  MainTabScreenProps<'CreateOrder'>
>;

export type OrdersStackScreenProps<
  RouteName extends keyof OrdersStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<OrdersStackParamList, RouteName>,
  MainTabScreenProps<'Orders'>
>;

export type HomeStackScreenProps<RouteName extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, RouteName>,
    MainTabScreenProps<'Home'>
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
