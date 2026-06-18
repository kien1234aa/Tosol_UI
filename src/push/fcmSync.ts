import { PermissionsAndroid, Platform } from 'react-native';
import { registerDeviceToken } from '@/src/apis/push';
import {
  getFirebaseAppModule,
  getFirebaseMessagingModule,
} from './firebaseNative';
import { displayFcmForegroundNotification } from './displayFcmForegroundNotification';

async function ensureAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  if (granted) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Xin quyền thông báo, lấy FCM token và POST lên backend khi đã đăng nhập.
 */
export async function syncFcmTokenWithBackend(): Promise<void> {
  const app = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();

  if (app == null || messagingMod == null) {
    if (__DEV__) {
      console.warn('[FCM] bỏ qua sync — Firebase native chưa sẵn sàng');
    }
    return;
  }

  try {
    const messaging = messagingMod.getMessaging(app.getApp());

    if (Platform.OS === 'android') {
      const hasNotificationPermission = await ensureAndroidNotificationPermission();
      if (!hasNotificationPermission && __DEV__) {
        console.warn('[FCM] chưa có quyền POST_NOTIFICATIONS (Android 13+)');
      }
    }

    const authStatus = await messagingMod.requestPermission(messaging);
    const { AuthorizationStatus } = messagingMod;
    const blocked =
      Platform.OS === 'ios'
        ? !(
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL
          )
        : authStatus === AuthorizationStatus.DENIED;

    if (blocked) {
      if (__DEV__) {
        console.warn('[FCM] bỏ qua đăng ký token (quyền thông báo)', {
          authStatus,
          os: Platform.OS,
        });
      }
      return;
    }

    const token = await messagingMod.getToken(messaging);

    if (!token) {
      if (__DEV__) {
        console.warn('[FCM] getToken trả về rỗng');
      }
      return;
    }

    if (__DEV__) {
      console.log('[FCM] registration token:', token);
    }

    await registerDeviceToken(token);

    if (__DEV__) {
      console.log('[FCM] đã POST token lên backend');
    }
  } catch (error) {
    if (__DEV__) {
      const message = error instanceof Error ? error.message : String(error);

      if (
        Platform.OS === 'ios' &&
        (message.includes('aps-environment') ||
          message.includes('messaging/unregistered'))
      ) {
        console.warn(
          '[FCM] iOS push không khả dụng trên Personal Team. ' +
            'Cần Apple Developer Program để test FCM trên iPhone.',
        );
        return;
      }

      console.warn('[FCM] sync failed', error);
    }
  }
}

let fcmListenersAttached = false;

/**
 * Gọi một lần khi khởi động app:
 * - token đổi → POST lại
 * - foreground: hiện banner in-app
 */
export function ensureFcmTokenRefreshListener(): void {
  if (fcmListenersAttached) {
    return;
  }

  const app = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();

  if (app == null || messagingMod == null) {
    if (__DEV__) {
      console.warn('[FCM] bỏ qua listener — Firebase native chưa sẵn sàng');
    }
    return;
  }

  fcmListenersAttached = true;

  const messaging = messagingMod.getMessaging(app.getApp());

  messagingMod.onTokenRefresh(messaging, async newToken => {
    if (__DEV__) {
      console.log('[FCM] token refresh:', newToken);
    }

    try {
      await registerDeviceToken(newToken);
    } catch (error) {
      if (__DEV__) {
        console.warn('[FCM] token refresh POST failed', error);
      }
    }
  });

  messagingMod.onMessage(messaging, async remoteMessage => {
    if (__DEV__) {
      console.log('[FCM] foreground onMessage', remoteMessage);
    }

    displayFcmForegroundNotification(remoteMessage);
  });
}
