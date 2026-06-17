import type { NotificationType } from '@/src/types/notifications/notifications.types';

export const notificationsCopy = {
  title: 'Thông báo',
  back: 'Quay lại',
  markAllRead: 'Đọc tất cả',
  emptyPersonal: 'Chưa có thông báo cá nhân',
  emptySystem: 'Chưa có thông báo hệ thống',
  emptyAll: 'Chưa có thông báo nào',
  filterPersonal: 'Cá nhân',
  filterSystem: 'Hệ thống',
  loading: 'Đang tải thông báo...',
  loadingMore: 'Đang tải thêm...',
  loadError: 'Không thể tải danh sách thông báo',
  retry: 'Thử lại',
} as const;

export const notificationTypeLabels: Record<NotificationType, string> = {
  order: 'Đơn hàng',
  payment: 'Thanh toán',
  delivery: 'Giao hàng',
  system: 'Hệ thống',
};
