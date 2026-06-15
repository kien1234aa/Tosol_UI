import type {
  AppNotification,
  NotificationCategory,
  NotificationFilter,
} from '@/src/types/notifications/notifications.types';

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
