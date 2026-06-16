import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  getFirebaseAppModule,
  getFirebaseMessagingModule,
} from './firebaseNative';
import { PUSH_NOTIF_STORAGE_KEY } from '../notifications/notificationPrefsKeys';
import { postFcmTokenToBackend } from '@services/system/fcmTokenApi';
import { displayFcmForegroundNotification } from './displayFcmForegroundNotification';
import { buildFirebaseConsoleCustomDataFromTemplate } from './fcmNotificationTemplates';

async function isPushPreferenceOn(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PUSH_NOTIF_STORAGE_KEY);
    return raw !== '0';
  } catch {
    return true;
  }
}

async function requestAndroidPostNotificationsIfNeeded(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return;
  }
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  } catch {
    /* ignore */
  }
}

/**
 * Xin quyền (iOS / Android 13+), lấy FCM token và POST lên backend nếu đã cấu hình path.
 * Gọi sau khi user đã đăng nhập (header Authorization có token).
 */
export async function syncFcmTokenWithBackend(): Promise<void> {
  if (!(await isPushPreferenceOn())) {
    return;
  }

  await requestAndroidPostNotificationsIfNeeded();

  const app = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();
  if (app == null || messagingMod == null) {
    return;
  }

  try {
    const messaging = messagingMod.getMessaging(app.getApp());
    const authStatus = await messagingMod.requestPermission(messaging);
    /**
     * Android: RN Firebase hay trả NOT_DETERMINED (-1) dù vẫn lấy được FCM token.
     * Chỉ chặn khi DENIED (0). iOS: giữ logic AUTHORIZED / PROVISIONAL.
     */
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
      return;
    }

    if (__DEV__) {
      console.log('[FCM] registration token:', token);
      const customData = buildFirebaseConsoleCustomDataFromTemplate(
        'order-has-issue',
      );
      if (customData != null) {
        console.log(
          '[FCM] Firebase Console → Additional options → Custom data (mỗi dòng một key):',
          customData,
        );
      }
    }

    await postFcmTokenToBackend(token);
  } catch (e: unknown) {
    if (__DEV__) {
      const message = e instanceof Error ? e.message : String(e);
      if (
        Platform.OS === 'ios' &&
        (message.includes('aps-environment') ||
          message.includes('messaging/unregistered'))
      ) {
        console.warn(
          '[FCM] iOS push không khả dụng trên Personal Team (Apple Developer miễn phí). ' +
            'Cần tài khoản Developer Program ($99/năm) để test FCM trên iPhone.',
        );
        return;
      }
      console.warn('[FCM] sync failed', e);
    }
  }
}

let fcmListenersAttached = false;

/**
 * Gọi một lần khi khởi động app:
 * - token đổi → POST lại (khi đã đăng nhập interceptor mới có Bearer)
 * - foreground: chỉ log (__DEV__); không dùng Alert — tin test hiện trên thanh khi app ở nền.
 */
export function ensureFcmTokenRefreshListener(): void {
  if (fcmListenersAttached) {
    return;
  }
  fcmListenersAttached = true;

  const app = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();
  if (app == null || messagingMod == null) {
    return;
  }
  const messaging = messagingMod.getMessaging(app.getApp());
  messagingMod.onTokenRefresh(messaging, async newToken => {
    if (!(await isPushPreferenceOn())) {
      return;
    }
    await postFcmTokenToBackend(newToken);
  });

  messagingMod.onMessage(messaging, async remoteMessage => {
    if (__DEV__) {
      console.log('[FCM] foreground onMessage', remoteMessage);
    }
    displayFcmForegroundNotification(remoteMessage);
  });
}
