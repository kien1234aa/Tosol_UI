import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import type { NotificationActionPayload } from '@/src/types/notifications/notifications.types';

const FCM_META_KEYS = new Set([
  'action_url',
  'actionUrl',
  'link',
  'deep_link',
  'deeplink',
  'deepLink',
  'url',
  'target',
  'notification_id',
  'notificationId',
  'type',
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

/** @deprecated Use FcmNotificationPayload / extractFcmNotificationPayload */
export interface FcmNotificationText {
  title: string;
  body: string;
  actionUrl: string | null;
}

export type FcmNotificationPayload = NotificationActionPayload;

export function extractFcmNotificationPayload(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): FcmNotificationPayload | null {
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
  const notificationId =
    readDataString(raw, 'notification_id', 'notificationId', 'id') || null;
  const type = readDataString(raw, 'type') || null;

  if (!title && !body) {
    return null;
  }

  return {
    notificationId,
    type,
    actionUrl,
    title: title || 'Tosol',
    body,
  };
}

export function extractFcmNotificationText(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): FcmNotificationText | null {
  const payload = extractFcmNotificationPayload(remoteMessage);

  if (payload == null) {
    return null;
  }

  return {
    title: payload.title,
    body: payload.body,
    actionUrl: payload.actionUrl,
  };
}

export function resolveActionUrlFromFcmMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): string | null {
  if (remoteMessage == null) {
    return null;
  }

  return extractFcmNotificationPayload(remoteMessage)?.actionUrl ?? null;
}

export function resolveNotificationPayloadFromFcmMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): FcmNotificationPayload | null {
  if (remoteMessage == null) {
    return null;
  }

  return extractFcmNotificationPayload(remoteMessage);
}

export { FCM_META_KEYS };
