import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { extractFcmNotificationText } from './fcmMessage.helpers';
import { handleFcmNotificationOpen } from './fcmLinking';
import { showForegroundPushBanner } from './foregroundPushBanner';

/**
 * Foreground: banner in-app theo theme Tosol.
 * Background: FCM/APNs hiển thị notification hệ thống.
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
