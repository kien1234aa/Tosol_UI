import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Central route registry for the root stack navigator. */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
