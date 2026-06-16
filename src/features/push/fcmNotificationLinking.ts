import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { openNotificationDeepLinkFromActionUrl } from '../notifications/notificationDeepLink';
import { resolveActionUrlFromFcmMessage } from './fcmApiNotificationAdapter';
import {
  getFirebaseAppModule,
  getFirebaseMessagingModule,
} from './firebaseNative';

let pendingActionUrl: string | null = null;
let notificationOpenedListenerAttached = false;
let coldStartNotificationChecked = false;

/** Tap push → mở màn giống tap dòng trong API `/notifications`. */
export function handleFcmNotificationOpen(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): void {
  const url = resolveActionUrlFromFcmMessage(remoteMessage);
  if (url == null) {
    return;
  }
  const opened = openNotificationDeepLinkFromActionUrl(url);
  if (!opened) {
    pendingActionUrl = url;
  } else {
    pendingActionUrl = null;
  }
}

/** Gọi sau `setNotificationDeepLinkHandlers` — mở deep link đã chờ khi SalesLayout mount. */
export function flushPendingFcmNotificationOpen(): void {
  if (pendingActionUrl == null) {
    return;
  }
  const url = pendingActionUrl;
  pendingActionUrl = null;
  openNotificationDeepLinkFromActionUrl(url);
}

/** Gọi một lần khi app khởi động — khi user tap thông báo lúc app ở nền. */
export function ensureFcmNotificationOpenedAppListener(): void {
  if (notificationOpenedListenerAttached) {
    return;
  }
  const app = getFirebaseAppModule();
  const messaging = getFirebaseMessagingModule();
  if (app == null || messaging == null) {
    return;
  }
  notificationOpenedListenerAttached = true;
  messaging.onNotificationOpenedApp(
    messaging.getMessaging(app.getApp()),
    remoteMessage => {
      handleFcmNotificationOpen(remoteMessage);
    },
  );
}

/**
 * Gọi một lần sớm (App.tsx) — tap thông báo khi app bị kill / máy vừa bật lại.
 * Nếu SalesLayout chưa mount, URL được queue và flush khi có handler.
 */
export function ensureFcmColdStartNotification(): void {
  if (coldStartNotificationChecked) {
    return;
  }
  coldStartNotificationChecked = true;
  const app = getFirebaseAppModule();
  const messaging = getFirebaseMessagingModule();
  if (app == null || messaging == null) {
    return;
  }
  void messaging
    .getInitialNotification(messaging.getMessaging(app.getApp()))
    .then(msg => {
      if (msg != null) {
        handleFcmNotificationOpen(msg);
      }
    })
    .catch(() => {});
}

/** @deprecated Dùng `resolveActionUrlFromFcmMessage` */
export function extractActionUrlFromFcmMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): string | undefined {
  const url = resolveActionUrlFromFcmMessage(remoteMessage);
  return url ?? undefined;
}
