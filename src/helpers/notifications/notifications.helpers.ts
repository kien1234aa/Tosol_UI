import type {
  AppNotification,
  NotificationApiItem,
  NotificationCategory,
  NotificationFilter,
  NotificationType,
} from '@/src/types/notifications/notifications.types';

function mapApiCategory(category?: string | null): NotificationCategory {
  if (category?.trim().toLowerCase() === 'system') {
    return 'system';
  }

  return 'personal';
}

function mapApiNotificationType(
  type: string,
  category?: string | null,
): NotificationType {
  const normalized = type.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase() ?? '';

  if (
    normalized.includes('order') ||
    normalizedCategory === 'orders'
  ) {
    return 'order';
  }

  if (
    normalized.includes('payment') ||
    normalized.includes('settlement') ||
    normalized.includes('billing') ||
    normalizedCategory === 'billing'
  ) {
    return 'payment';
  }

  if (
    normalized.includes('delivery') ||
    normalized.includes('shipment') ||
    normalized.includes('shipping')
  ) {
    return 'delivery';
  }

  return 'system';
}

export function mapApiNotificationToAppNotification(
  item: NotificationApiItem,
): AppNotification {
  return {
    id: item.id,
    category: mapApiCategory(item.category),
    type: mapApiNotificationType(item.type, item.category),
    apiType: item.type.trim(),
    typeLabel: item.type_label?.trim() || item.type,
    icon: item.icon,
    title: item.title,
    message: item.message,
    actionUrl: item.action_url?.trim() || null,
    createdAt: item.created_at,
    isRead: item.is_read,
    severity: item.severity?.trim() || 'info',
  };
}

export function mapApiNotificationsToAppNotifications(
  items: NotificationApiItem[],
): AppNotification[] {
  return items.map(mapApiNotificationToAppNotification);
}

export function filterNotifications(
  items: AppNotification[],
  filter: NotificationFilter,
): AppNotification[] {
  return items.filter(item => item.category === filter);
}

export function countUnreadNotificationsByCategory(
  items: AppNotification[],
  category: NotificationCategory,
): number {
  return items.filter(item => item.category === category && !item.isRead)
    .length;
}

export function formatNotificationTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Vừa xong';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function countUnreadNotifications(items: AppNotification[]): number {
  return items.filter(item => !item.isRead).length;
}
