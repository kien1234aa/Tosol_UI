/** Domain models for in-app notifications. */

export type NotificationCategory = 'personal' | 'system';

export type NotificationType = 'order' | 'payment' | 'delivery' | 'system';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export type NotificationFilter = NotificationCategory;
