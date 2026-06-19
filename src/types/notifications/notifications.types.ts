/** Domain models for in-app notifications. */

export type NotificationCategory = 'personal' | 'system';

export type NotificationType = 'order' | 'payment' | 'delivery' | 'system';

/** Raw `type` from API / FCM data (server enum, ~23 values). */
export type NotificationApiType = string;

/** FCM `data` payload when notification includes action_url. */
export interface NotificationActionPayload {
  notificationId: string | null;
  type: NotificationApiType | null;
  actionUrl: string | null;
  title: string;
  body: string;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  apiType: NotificationApiType;
  typeLabel: string;
  icon: string;
  title: string;
  message: string;
  actionUrl: string | null;
  createdAt: string;
  isRead: boolean;
  severity: string;
}

export type NotificationFilter = NotificationCategory;

/** GET /notifications — API shapes. */

export interface NotificationApiItem {
  id: string;
  type: string;
  type_label?: string | null;
  category?: string | null;
  severity?: string | null;
  icon: string;
  title: string;
  message: string;
  action_url?: string | null;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface NotificationListParams {
  page?: number;
  perPage?: number;
}
