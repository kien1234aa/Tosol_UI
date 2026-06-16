import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import type { ApiNotification } from '@services/system/notificationsApi';
import {
  buildFcmDataFromApiNotification,
  buildRemoteMessageFromApiNotification,
} from './fcmApiNotificationAdapter';
import { displayFcmForegroundNotification } from './displayFcmForegroundNotification';

/**
 * Mẫu push notification có deep link — dùng cho backend / test app.
 *
 * `action_url` parse qua `parseNotificationTarget` → mở màn tương ứng khi user tap.
 * Format: `{kind}/{slug}` hoặc `api/v1/{kind}/{slug}` hoặc URL đầy đủ.
 */
export type FcmNotificationTemplate = {
  id: string;
  label: string;
  description: string;
  title: string;
  body: string;
  /** Đường dẫn mở màn — ưu tiên key `action_url` trong FCM `data`. */
  action_url: string;
  /** Màn đích (để doc / filter). */
  targetScreen: string;
};

/** Các `kind` app hỗ trợ deep link từ push (xem `notificationDeepLink.ts`). */
export const FCM_DEEPLINK_KINDS = [
  'sale-orders',
  'inbound-orders',
  'packing-orders',
  'outbound-orders',
  'transfer-orders',
  'purchase-orders',
  'payments',
  'invoices',
  'settlements',
  'combo-assemblies',
] as const;

export type FcmDeeplinkKind = (typeof FCM_DEEPLINK_KINDS)[number];

/** Thay slug bằng mã thật khi gửi production. */
export const FCM_NOTIFICATION_TEMPLATES: FcmNotificationTemplate[] = [
  {
    id: 'sale-order',
    label: 'Đơn bán hàng',
    description: 'Mở chi tiết đơn SO',
    title: 'Đơn hàng mới',
    body: 'Đơn SO-2026-00042 cần xử lý',
    action_url: 'sale-orders/SO-2026-00042',
    targetScreen: 'Sales → Order detail',
  },
  {
    id: 'inbound-order',
    label: 'Phiếu nhập kho',
    description: 'Mở chi tiết phiếu nhập',
    title: 'Phiếu nhập kho',
    body: 'IBP-MCT-26000001 đã đến kho',
    action_url: 'inbound-orders/IBP-MCT-26000001',
    targetScreen: 'Kho → Inbound detail',
  },
  {
    id: 'packing-order',
    label: 'Phiếu đóng gói',
    description: 'Mở chi tiết đóng gói',
    title: 'Đóng gói',
    body: 'PKG-2026-00118 đang chờ',
    action_url: 'packing-orders/PKG-2026-00118',
    targetScreen: 'Kho → Packing detail',
  },
  {
    id: 'outbound-order',
    label: 'Phiếu xuất kho',
    description: 'Mở chi tiết xuất kho',
    title: 'Xuất kho',
    body: 'OUT-2026-00007 đã sẵn sàng',
    action_url: 'outbound-orders/OUT-2026-00007',
    targetScreen: 'Kho → Outbound detail',
  },
  {
    id: 'payment',
    label: 'Thanh toán',
    description: 'Mở chi tiết phiếu thu/chi',
    title: 'Thanh toán',
    body: 'Phiếu PAY-2026-0033 đã ghi nhận',
    action_url: 'payments/PAY-2026-0033',
    targetScreen: 'Tài chính → Payment detail',
  },
  {
    id: 'invoice',
    label: 'Hóa đơn',
    description: 'Mở chi tiết hóa đơn',
    title: 'Hóa đơn',
    body: 'INV-2026-0088 đã phát hành',
    action_url: 'invoices/INV-2026-0088',
    targetScreen: 'Tài chính → Invoice detail',
  },
  {
    id: 'inbound-snake-case',
    label: 'API snake_case',
    description: 'Backend Laravel gửi inbound_orders/…',
    title: 'Nhập kho (API)',
    body: 'Đơn api/v1/inbound_orders/IBP-MCT-26000002',
    action_url: 'api/v1/inbound_orders/IBP-MCT-26000002',
    targetScreen: 'Kho → Inbound detail',
  },
  {
    id: 'order-has-issue',
    label: 'Order Has Issue (API thật)',
    description: 'Khớp payload GET /notifications — mở đơn OR-MCT-2600060',
    title: 'Order Has Issue',
    body: 'Order OR-MCT-2600060 has an issue: Sai địa chi',
    action_url: '/sale-orders/OR-MCT-2600060',
    targetScreen: 'Sales → Order detail',
  },
];

export function getFcmNotificationTemplate(
  id: string,
): FcmNotificationTemplate | undefined {
  return FCM_NOTIFICATION_TEMPLATES.find(t => t.id === id);
}

function iconForFcmTemplate(template: FcmNotificationTemplate): string {
  if (template.id === 'order-has-issue') {
    return 'alert-circle';
  }
  if (template.id === 'invoice') {
    return 'file-invoice';
  }
  if (template.id === 'payment') {
    return 'receipt';
  }
  if (
    template.id.includes('inbound') ||
    template.id.includes('packing') ||
    template.id.includes('outbound')
  ) {
    return 'package-check';
  }
  return 'send';
}

/** Chuyển mẫu push dev → `ApiNotification` để render cùng UI danh sách. */
export function fcmTemplateToApiNotification(
  template: FcmNotificationTemplate,
  index: number,
): ApiNotification {
  const created_at = new Date(
    Date.now() - (index + 1) * 3_600_000,
  ).toISOString();

  const base: ApiNotification = {
    id: `dev-template-${template.id}`,
    type: template.id === 'order-has-issue' ? 'order_has_issue' : template.id,
    title: template.title,
    message: template.body,
    icon: iconForFcmTemplate(template),
    action_url: template.action_url,
    is_read: true,
    read_at: created_at,
    created_at,
  };

  if (template.id === 'order-has-issue') {
    return {
      ...base,
      data: {
        order_number: 'OR-MCT-2600060',
        issue: 'Sai địa chi',
      },
    };
  }

  return base;
}

/** Mẫu dev hiển thị trong list — chỉ khi `__DEV__`. */
export function devFcmTemplatesAsNotifications(): ApiNotification[] {
  if (!__DEV__) {
    return [];
  }
  return FCM_NOTIFICATION_TEMPLATES.map(fcmTemplateToApiNotification);
}

/**
 * Key/value dán vào Firebase Console → Messaging → Additional options → Custom data.
 * `action_url` nằm trong `data` — app tap push mở màn giống API `/notifications`.
 */
export function buildFirebaseConsoleCustomDataFromTemplate(
  templateId: string,
): Record<string, string> | null {
  const template = getFcmNotificationTemplate(templateId);
  if (template == null) {
    return null;
  }

  const data: Record<string, string> = {
    action_url: template.action_url,
    title: template.title,
    message: template.body,
    type: template.id === 'order-has-issue' ? 'order_has_issue' : 'template',
  };

  if (template.id === 'order-has-issue') {
    data.id = 'a1f2c550-209b-4aa2-abd4-e80ed47eb007';
    data.icon = 'alert-circle';
    data.order_number = 'OR-MCT-2600060';
    data.issue = 'Sai địa chi';
  }

  return data;
}

/** Build RemoteMessage giả lập từ mẫu (test foreground banner + tap deep link). */
export function buildRemoteMessageFromTemplate(
  template: FcmNotificationTemplate,
  overrides?: Partial<Pick<FcmNotificationTemplate, 'title' | 'body' | 'action_url'>>,
): FirebaseMessagingTypes.RemoteMessage {
  const title = overrides?.title ?? template.title;
  const body = overrides?.body ?? template.body;
  const action_url = overrides?.action_url ?? template.action_url;

  return {
    messageId: `template-${template.id}-${Date.now()}`,
    notification: { title, body },
    data: {
      action_url,
      title,
      message: body,
      type: 'template',
    },
    fcmOptions: {},
  };
}

/**
 * Payload FCM HTTP v1 gợi ý cho backend (iOS + Android).
 * Copy `message` vào body POST Firebase.
 */
export function buildFcmHttpV1PayloadFromTemplate(
  template: FcmNotificationTemplate,
  fcmToken: string,
): Record<string, unknown> {
  const title = template.title;
  const body = template.body;
  const action_url = template.action_url;

  return {
    message: {
      token: fcmToken,
      notification: { title, body },
      data: {
        action_url,
        title,
        message: body,
      },
      android: {
        priority: 'HIGH',
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default',
          },
        },
      },
    },
  };
}

/** DEV: hiện banner foreground + tap mở deep link theo mẫu. */
export function previewFcmNotificationTemplate(
  templateId: string,
  overrides?: Partial<Pick<FcmNotificationTemplate, 'title' | 'body' | 'action_url'>>,
): boolean {
  if (!__DEV__) {
    return false;
  }
  const template = getFcmNotificationTemplate(templateId);
  if (template == null) {
    return false;
  }
  displayFcmForegroundNotification(
    buildRemoteMessageFromTemplate(template, overrides),
  );
  return true;
}

/** Tạo mẫu tùy chỉnh: `{kind}/{slug}` → màn tương ứng. */
export function buildFcmTemplateForKind(
  kind: FcmDeeplinkKind,
  slug: string,
  title: string,
  body: string,
): FcmNotificationTemplate {
  return {
    id: `custom-${kind}-${slug}`,
    label: `${kind}/${slug}`,
    description: 'Mẫu tùy chỉnh',
    title,
    body,
    action_url: `${kind}/${slug}`,
    targetScreen: kind,
  };
}

export {
  buildFcmDataFromApiNotification,
  buildRemoteMessageFromApiNotification,
} from './fcmApiNotificationAdapter';

/** Payload FCM HTTP v1 từ bản ghi API `/notifications`. */
export function buildFcmHttpV1PayloadFromApiNotification(
  n: Pick<
    ApiNotification,
    | 'id'
    | 'type'
    | 'title'
    | 'message'
    | 'action_url'
    | 'data'
    | 'created_at'
    | 'icon'
  >,
  fcmToken: string,
): Record<string, unknown> {
  const data = buildFcmDataFromApiNotification(n);
  const title = n.title;
  const body = n.message;

  return {
    message: {
      token: fcmToken,
      notification: { title, body },
      data,
      android: { priority: 'HIGH' },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default',
          },
        },
      },
    },
  };
}

/** DEV: preview push từ object API notifications. */
export function previewFcmNotificationFromApi(
  n: Pick<
    ApiNotification,
    | 'id'
    | 'type'
    | 'title'
    | 'message'
    | 'action_url'
    | 'data'
    | 'created_at'
    | 'icon'
  >,
): boolean {
  if (!__DEV__) {
    return false;
  }
  displayFcmForegroundNotification(buildRemoteMessageFromApiNotification(n));
  return true;
}
