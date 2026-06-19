import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/src/navigation/types';
import type { NotificationActionPayload } from '@/src/types/notifications/notifications.types';
import { store } from '@/src/redux';
import {
  fetchNotificationsThunk,
  markNotificationReadThunk,
} from '@/src/redux/notifications';

type RootNavigationRef = NavigationContainerRef<RootStackParamList>;

let navigationRef: RootNavigationRef | null = null;

export function setNavigationRef(ref: RootNavigationRef | null): void {
  navigationRef = ref;
}

function refreshNotifications(): void {
  void store.dispatch(fetchNotificationsThunk({ page: 1, append: false }));
}

function markNotificationReadIfNeeded(notificationId: string | null): void {
  const id = notificationId?.trim();

  if (!id) {
    return;
  }

  void store.dispatch(markNotificationReadThunk(id));
}

function navigateToNotifications(): boolean {
  if (navigationRef?.isReady() !== true) {
    return false;
  }

  navigationRef.navigate('Notifications');
  refreshNotifications();
  return true;
}

function navigateToOrdersMain(): boolean {
  if (navigationRef?.isReady() !== true) {
    return false;
  }

  navigationRef.navigate('Main', {
    screen: 'Orders',
    params: { screen: 'OrdersMain' },
  });
  refreshNotifications();
  return true;
}

function navigateToOrderDetail(orderNumber: string): boolean {
  if (navigationRef?.isReady() !== true) {
    return false;
  }

  navigationRef.navigate('Main', {
    screen: 'Orders',
    params: {
      screen: 'OrderDetail',
      params: { orderId: orderNumber },
    },
  });
  refreshNotifications();
  return true;
}

function parseActionUrlPath(actionUrl: string): string {
  return actionUrl.trim().replace(/^\/+/, '').split(/[?#]/)[0] ?? '';
}

function parseSaleOrderNumber(actionUrl: string): string | null {
  const path = parseActionUrlPath(actionUrl);

  if (!path) {
    return null;
  }

  const match = path.match(/^sale-orders\/([^/]+)/i);

  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

function navigateFromActionUrl(actionUrl: string | null): boolean {
  if (navigationRef?.isReady() !== true) {
    return false;
  }

  if (actionUrl == null || actionUrl.trim() === '') {
    return navigateToNotifications();
  }

  const path = parseActionUrlPath(actionUrl).toLowerCase();

  if (path === 'notifications') {
    return navigateToNotifications();
  }

  if (path === 'orders' || path === 'sale-orders') {
    return navigateToOrdersMain();
  }

  const orderNumber = parseSaleOrderNumber(actionUrl);

  if (orderNumber) {
    return navigateToOrderDetail(orderNumber);
  }

  return navigateToNotifications();
}

/**
 * Mở màn từ action_url (FCM data / API notifications).
 * Trả về true nếu điều hướng thành công hoặc đã queue.
 */
export function openNotificationActionUrl(actionUrl: string | null): boolean {
  return navigateFromActionUrl(actionUrl);
}

/**
 * Xử lý payload thông báo có action_url:
 * - đánh dấu đã đọc theo notification_id (nếu có)
 * - điều hướng theo action_url
 */
export function openNotificationPayload(
  payload: Pick<
    NotificationActionPayload,
    'actionUrl' | 'notificationId'
  >,
): boolean {
  markNotificationReadIfNeeded(payload.notificationId);
  return navigateFromActionUrl(payload.actionUrl);
}
