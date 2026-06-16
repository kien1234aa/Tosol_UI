import { Platform } from 'react-native';

type FirebaseAppModule = typeof import('@react-native-firebase/app');
type FirebaseMessagingModule =
  typeof import('@react-native-firebase/messaging');

let appModule: FirebaseAppModule | null | undefined;
let messagingModule: FirebaseMessagingModule | null | undefined;

function loadAppModule(): FirebaseAppModule | null {
  if (appModule !== undefined) {
    return appModule;
  }
  try {
    appModule = require('@react-native-firebase/app') as FirebaseAppModule;
    appModule.getApp();
    return appModule;
  } catch (e) {
    if (__DEV__) {
      console.warn(
        '[Firebase] Native module chưa sẵn sàng (pod install / GoogleService-Info.plist).',
        Platform.OS,
        e,
      );
    }
    appModule = null;
    return null;
  }
}

function loadMessagingModule(): FirebaseMessagingModule | null {
  if (messagingModule !== undefined) {
    return messagingModule;
  }
  if (loadAppModule() == null) {
    messagingModule = null;
    return null;
  }
  try {
    messagingModule =
      require('@react-native-firebase/messaging') as FirebaseMessagingModule;
    return messagingModule;
  } catch (e) {
    if (__DEV__) {
      console.warn('[Firebase] Messaging module unavailable', e);
    }
    messagingModule = null;
    return null;
  }
}

export function isFirebaseNativeAvailable(): boolean {
  return loadAppModule() != null && loadMessagingModule() != null;
}

export function getFirebaseAppModule(): FirebaseAppModule | null {
  return loadAppModule();
}

export function getFirebaseMessagingModule(): FirebaseMessagingModule | null {
  return loadMessagingModule();
}
