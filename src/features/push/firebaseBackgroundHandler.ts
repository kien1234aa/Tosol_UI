import { getFirebaseAppModule, getFirebaseMessagingModule } from './firebaseNative';

/** Đăng ký handler nền — bỏ qua nếu iOS chưa có pod / GoogleService-Info.plist. */
export function setupFirebaseBackgroundHandler(): void {
  const appMod = getFirebaseAppModule();
  const messagingMod = getFirebaseMessagingModule();
  if (appMod == null || messagingMod == null) {
    return;
  }
  try {
    const messaging = messagingMod.getMessaging(appMod.getApp());
    if (typeof messagingMod.setBackgroundMessageHandler !== 'function') {
      return;
    }
    messagingMod.setBackgroundMessageHandler(messaging, async () => {
      /* Headless: giữ handler để tránh cảnh báo khi tin đến nền */
    });
  } catch (e) {
    if (__DEV__) {
      console.warn('[Firebase] setupFirebaseBackgroundHandler skipped', e);
    }
  }
}
