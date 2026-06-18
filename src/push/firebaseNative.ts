import { Platform } from 'react-native';

type FirebaseAppModule = typeof import('@react-native-firebase/app');
type FirebaseMessagingModule =
  typeof import('@react-native-firebase/messaging');

let cachedAppModule: FirebaseAppModule | null = null;
let cachedMessagingModule: FirebaseMessagingModule | null = null;

function loadAppModule(): FirebaseAppModule | null {
  if (cachedAppModule != null) {
    return cachedAppModule;
  }

  try {
    const mod = require('@react-native-firebase/app') as FirebaseAppModule;
    mod.getApp();
    cachedAppModule = mod;
    return mod;
  } catch (error) {
    if (__DEV__) {
      const setupHint =
        Platform.OS === 'android'
          ? 'Android: google-services.json + applicationId khớp package_name, rebuild app (yarn android).'
          : 'iOS: pod install + GoogleService-Info.plist khớp bundle id.';
      console.warn('[Firebase] Native module chưa sẵn sàng.', setupHint, error);
    }
    return null;
  }
}

function loadMessagingModule(): FirebaseMessagingModule | null {
  if (cachedMessagingModule != null) {
    return cachedMessagingModule;
  }

  if (loadAppModule() == null) {
    return null;
  }

  try {
    cachedMessagingModule =
      require('@react-native-firebase/messaging') as FirebaseMessagingModule;
    return cachedMessagingModule;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Firebase] Messaging module unavailable', error);
    }
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
