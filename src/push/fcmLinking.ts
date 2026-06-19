import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { resolveNotificationPayloadFromFcmMessage } from './fcmMessage.helpers';
import {
  getFirebaseAppModule,
  getFirebaseMessagingModule,
} from './firebaseNative';
import {
  openNotificationActionUrl,
  openNotificationPayload,
} from './notificationNavigation';
import type { NotificationActionPayload } from '@/src/types/notifications/notifications.types';

let pendingPayload: NotificationActionPayload | null = null;
let notificationOpenedListenerAttached = false;
let coldStartNotificationChecked = false;

function queueOrOpenPayload(payload: NotificationActionPayload): void {
  const opened = openNotificationPayload(payload);

  if (!opened) {
    pendingPayload = payload;
  } else {
    pendingPayload = null;
  }
}

export function handleFcmNotificationOpen(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): void {
  const payload = resolveNotificationPayloadFromFcmMessage(remoteMessage);

  if (payload == null) {
    const opened = openNotificationActionUrl(null);

    if (!opened) {
      pendingPayload = {
        notificationId: null,
        type: null,
        actionUrl: null,
        title: '',
        body: '',
      };
    } else {
      pendingPayload = null;
    }

    return;
  }

  queueOrOpenPayload(payload);
}

export function flushPendingFcmNotificationOpen(): void {
  if (pendingPayload == null) {
    return;
  }

  const payload = pendingPayload;
  pendingPayload = null;
  openNotificationPayload(payload);
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
