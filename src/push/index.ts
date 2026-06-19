export { setupFirebaseBackgroundHandler } from './firebaseBackgroundHandler';
export { isFirebaseNativeAvailable, getFirebaseMessagingModule } from './firebaseNative';
export {
  syncFcmTokenWithBackend,
  ensureFcmTokenRefreshListener,
} from './fcmSync';
export {
  ensureFcmColdStartNotification,
  ensureFcmNotificationOpenedAppListener,
  flushPendingFcmNotificationOpen,
  handleFcmNotificationOpen,
} from './fcmLinking';
export { ForegroundPushBannerHost } from './ForegroundPushBannerHost';
export { setNavigationRef, openNotificationActionUrl, openNotificationPayload } from './notificationNavigation';
