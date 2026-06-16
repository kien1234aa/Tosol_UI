import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import type { ApiNotification } from '@services/system/notificationsApi';
import { resolveNotificationActionUrl } from '../notifications/notificationResolveActionUrl';

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
  'id',
  'notification_id',
  'type',
  'type_label',
  'category',
  'severity',
  'icon',
  'is_read',
  'read_at',
  'created_at',
  'updated_at',
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

function parseNestedData(
  raw: Record<string, string | object>,
): Record<string, unknown> {
  const nested: Record<string, unknown> = {};

  const rawData = raw.data;
  if (typeof rawData === 'string' && rawData.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawData) as unknown;
      if (parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        Object.assign(nested, parsed as Record<string, unknown>);
      }
    } catch {
      /* ignore invalid JSON */
    }
  }

  for (const [key, value] of Object.entries(raw)) {
    if (FCM_META_KEYS.has(key)) {
      continue;
    }
    if (typeof value === 'string') {
      nested[key] = value;
    }
  }

  return nested;
}

/**
 * FCM `data` + `notification` → cùng shape với bản ghi API `GET /notifications`.
 * Backend có thể gửi flat string fields giống response API.
 */
export function remoteMessageToApiNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): ApiNotification {
  const raw = (remoteMessage.data ?? {}) as Record<string, string | object>;

  const title =
    remoteMessage.notification?.title?.trim() ||
    readDataString(raw, 'title', 'notification_title', 'subject');
  const message =
    remoteMessage.notification?.body?.trim() ||
    readDataString(raw, 'message', 'body', 'notification_body', 'content');

  const actionUrlRaw = readDataString(
    raw,
    'action_url',
    'actionUrl',
    'link',
    'deep_link',
    'deeplink',
    'deepLink',
    'url',
    'target',
  );

  return {
    id:
      readDataString(raw, 'id', 'notification_id') ||
      remoteMessage.messageId ||
      '',
    type: readDataString(raw, 'type') || 'push',
    type_label: readDataString(raw, 'type_label') || undefined,
    category: readDataString(raw, 'category') || undefined,
    severity: readDataString(raw, 'severity') || undefined,
    icon: readDataString(raw, 'icon') || 'alert-circle',
    title: title || 'TOSOL',
    message,
    action_url: actionUrlRaw || null,
    data: parseNestedData(raw),
    is_read: readDataString(raw, 'is_read') === 'true',
    read_at: readDataString(raw, 'read_at') || null,
    created_at: readDataString(raw, 'created_at') || new Date().toISOString(),
    updated_at: readDataString(raw, 'updated_at') || undefined,
  };
}

/** Deep link từ FCM — dùng chung logic với tap item trong `/notifications`. */
export function resolveActionUrlFromFcmMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null | undefined,
): string | null {
  if (remoteMessage == null) {
    return null;
  }
  return resolveNotificationActionUrl(
    remoteMessageToApiNotification(remoteMessage),
  );
}

export function extractFcmNotificationText(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): { title: string; body: string } | null {
  const n = remoteMessageToApiNotification(remoteMessage);
  if (!n.title && !n.message) {
    return null;
  }
  return {
    title: n.title || 'TOSOL',
    body: n.message,
  };
}

type ApiNotificationPushFields = Pick<
  ApiNotification,
  | 'id'
  | 'type'
  | 'type_label'
  | 'category'
  | 'severity'
  | 'icon'
  | 'title'
  | 'message'
  | 'action_url'
  | 'data'
  | 'created_at'
>;

/** Map bản ghi API `/notifications` → FCM `data` (string-only), giữ cùng field names. */
export function buildFcmDataFromApiNotification(
  n: ApiNotificationPushFields,
): Record<string, string> {
  const actionUrl =
    resolveNotificationActionUrl(n as ApiNotification) ?? n.action_url ?? '';

  const data: Record<string, string> = {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
  };

  if (n.type_label) {
    data.type_label = n.type_label;
  }
  if (n.category) {
    data.category = n.category;
  }
  if (n.severity) {
    data.severity = n.severity;
  }
  if (n.icon) {
    data.icon = n.icon;
  }
  if (n.created_at) {
    data.created_at = n.created_at;
  }
  if (actionUrl.trim() !== '') {
    data.action_url = actionUrl.trim();
  }

  const extra = n.data ?? {};
  for (const [key, value] of Object.entries(extra)) {
    if (value == null) {
      continue;
    }
    data[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }

  return data;
}

export function buildRemoteMessageFromApiNotification(
  n: ApiNotificationPushFields,
): FirebaseMessagingTypes.RemoteMessage {
  const data = buildFcmDataFromApiNotification(n);
  return {
    messageId: `api-notif-${n.id}`,
    notification: { title: n.title, body: n.message },
    data,
    fcmOptions: {},
  };
}
