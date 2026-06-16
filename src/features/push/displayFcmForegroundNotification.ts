import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { extractFcmNotificationText } from './fcmApiNotificationAdapter';
import { handleFcmNotificationOpen } from './fcmNotificationLinking';
import { showForegroundPushBanner } from './foregroundPushBanner';

/**
 * Foreground: banner in-app theo theme TOSOL (icon chuông, light/dark).
 * Background: FCM/APNs hiển thị notification hệ thống — payload giống API `/notifications`.
 */
export function displayFcmForegroundNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): void {
  const parsed = extractFcmNotificationText(remoteMessage);
  if (parsed == null) {
    return;
  }

  showForegroundPushBanner({
    title: parsed.title,
    body: parsed.body,
    onPress: () => handleFcmNotificationOpen(remoteMessage),
  });
}
