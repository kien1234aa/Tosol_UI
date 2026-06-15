jest.mock('@/src/uikits/gluestack-ui-provider', () => ({
  GluestackUIProvider: ({ children }) => children,
}));

jest.mock('@/src/navigation', () => ({
  RootNavigator: () => null,
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));
