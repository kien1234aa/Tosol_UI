import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { resolveActionUrlFromFcmMessage } from './fcmMessage.helpers';
import {
  getFirebaseAppModule,
  getFirebaseMessagingModule,
} from './firebaseNative';
import { openNotificationActionUrl } from './notificationNavigation';

let pendingActionUrl: string | null = null;
let notificationOpenedListenerAttached = false;
let coldStartNotificationChecked = false;

export function handleFcmNotificationOpen(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): void {
  const url = resolveActionUrlFromFcmMessage(remoteMessage);

  if (url == null) {
    const opened = openNotificationActionUrl(null);

    if (!opened) {
      pendingActionUrl = '';
    } else {
      pendingActionUrl = null;
    }

    return;
  }

  const opened = openNotificationActionUrl(url);

  if (!opened) {
    pendingActionUrl = url;
  } else {
    pendingActionUrl = null;
  }
}

export function flushPendingFcmNotificationOpen(): void {
  if (pendingActionUrl == null) {
    return;
  }

  const url = pendingActionUrl;
  pendingActionUrl = null;
  openNotificationActionUrl(url);
}

export function ensureFcmNotificationOpenedAppListener(): void {
  if (notificationOpenedListenerAttached) {
    return;
  }

  const app = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();

  if (app == null || messagingMod == null) {
    return;
  }

  notificationOpenedListenerAttached = true;

  messagingMod.onNotificationOpenedApp(
    messagingMod.getMessaging(app.getApp()),
    remoteMessage => {
      handleFcmNotificationOpen(remoteMessage);
    },
  );
}

export function ensureFcmColdStartNotification(): void {
  if (coldStartNotificationChecked) {
    return;
  }

  coldStartNotificationChecked = true;

  const app = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();

  if (app == null || messagingMod == null) {
    return;
  }

  void messagingMod
    .getInitialNotification(messagingMod.getMessaging(app.getApp()))
    .then(msg => {
      if (msg != null) {
        handleFcmNotificationOpen(msg);
      }
    })
    .catch(() => {});
}
