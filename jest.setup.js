jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-vector-icons/Ionicons', () => ({
  __esModule: true,
  default: { loadFont: jest.fn() },
}));

jest.mock('@/src/navigation/AppNavigator', () => ({
  AppNavigator: () => null,
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
  };
});

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(),
}));

jest.mock('@react-native-firebase/messaging', () => () => ({
  getToken: jest.fn(),
  onTokenRefresh: jest.fn(),
  onMessage: jest.fn(),
  onNotificationOpenedApp: jest.fn(),
  getInitialNotification: jest.fn(),
}));

jest.mock('@notifee/react-native', () => ({
  displayNotification: jest.fn(),
  createChannel: jest.fn(),
}));

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
}));

jest.mock('@/src/uikits/gluestack-ui-provider', () => ({
  GluestackUIProvider: ({ children }) => children,
}));

jest.mock('@features/push/fcmNotificationLinking', () => ({
  ensureFcmColdStartNotification: jest.fn(),
  ensureFcmNotificationOpenedAppListener: jest.fn(),
}));

jest.mock('@features/push/fcmSync', () => ({
  ensureFcmTokenRefreshListener: jest.fn(),
}));

jest.mock('@features/push/firebaseBackgroundHandler', () => ({
  setupFirebaseBackgroundHandler: jest.fn(),
}));

jest.mock('@shared/i18n', () => ({
  __esModule: true,
  default: { use: () => ({ init: jest.fn() }) },
}));
