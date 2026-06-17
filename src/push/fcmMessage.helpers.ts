import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const FCM_META_KEYS = new Set([
  'action_url',
  'actionUrl',
  'link',
  'deep_link',
  'deeplink',
  'deepLink',
  'url',
  'target',
  'title',
  'body',
  'message',
  'notification_title',
  'notification_body',
  'subject',
  'content',
]);

function readDataString(
  data: Record<string, string | object> | undefined,
  ...keys: string[]
): string {
  if (data == null) {
    return '';
  }

  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return '';
}

export interface FcmNotificationText {
  title: string;
  body: string;
  actionUrl: string | null;
}

export function extractFcmNotificationText(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): FcmNotificationText | null {
  const raw = (remoteMessage.data ?? {}) as Record<string, string | object>;

  const title =
    remoteMessage.notification?.title?.trim() ||
    readDataString(raw, 'title', 'notification_title', 'subject');
  const body =
    remoteMessage.notification?.body?.trim() ||
    readDataString(raw, 'message', 'body', 'notification_body', 'content');
  const actionUrl =
    readDataString(
      raw,
      'action_url',
      'actionUrl',
      'link',
      'deep_link',
      'deeplink',
      'deepLink',
      'url',
      'target',
    ) || null;

  if (!title && !body) {
    return null;
  }

  return {
    title: title || 'Tosol',
    body,
    actionUrl,
  };
}

export function resolveActionUrlFromFcmMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): string | null {
  if (remoteMessage == null) {
    return null;
  }

  return extractFcmNotificationText(remoteMessage)?.actionUrl ?? null;
}
