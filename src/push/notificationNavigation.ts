import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/src/navigation/types';
import { store } from '@/src/redux';
import { fetchNotificationsThunk } from '@/src/redux/notifications';

type RootNavigationRef = NavigationContainerRef<RootStackParamList>;

let navigationRef: RootNavigationRef | null = null;

export function setNavigationRef(ref: RootNavigationRef | null): void {
  navigationRef = ref;
}

function refreshNotifications(): void {
  void store.dispatch(fetchNotificationsThunk({ page: 1, append: false }));
}

function navigateToNotifications(): boolean {
  if (navigationRef?.isReady() !== true) {
    return false;
  }

  navigationRef.navigate('Notifications');
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

function parseSaleOrderNumber(actionUrl: string): string | null {
  const trimmed = actionUrl.trim();

  if (!trimmed) {
    return null;
  }

  const withoutLeadingSlash = trimmed.replace(/^\/+/, '');
  const match = withoutLeadingSlash.match(/^sale-orders\/([^/?#]+)/i);

  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Mở màn từ action_url FCM / API notifications.
 * Trả về true nếu điều hướng thành công hoặc đã queue.
 */
export function openNotificationActionUrl(actionUrl: string | null): boolean {
  if (navigationRef?.isReady() !== true) {
    return false;
  }

  if (actionUrl == null || actionUrl.trim() === '') {
    return navigateToNotifications();
  }

  const orderNumber = parseSaleOrderNumber(actionUrl);

  if (orderNumber) {
    return navigateToOrderDetail(orderNumber);
  }

  return navigateToNotifications();
}
