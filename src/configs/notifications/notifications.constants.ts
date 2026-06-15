import type {
  AppNotification,
  NotificationType,
} from '@/src/types/notifications/notifications.types';

export const notificationsCopy = {
  title: 'Thông báo',
  back: 'Quay lại',
  markAllRead: 'Đọc tất cả',
  emptyPersonal: 'Chưa có thông báo cá nhân',
  emptySystem: 'Chưa có thông báo hệ thống',
  filterPersonal: 'Cá nhân',
  filterSystem: 'Hệ thống',
} as const;

export const notificationTypeLabels: Record<NotificationType, string> = {
  order: 'Đơn hàng',
  payment: 'Thanh toán',
  delivery: 'Giao hàng',
  system: 'Hệ thống',
};

/** Mock in-app notifications. */
export const mockNotifications: AppNotification[] = [
  {
    id: 'n-1',
    category: 'personal',
    type: 'order',
    title: 'Đơn hàng chờ đặt cọc',
    message: 'Đơn #12979 đang chờ bạn đặt cọc 8.660đ để tiếp tục xử lý.',
    createdAt: '2026-06-15T09:30:00',
    isRead: false,
  },
  {
    id: 'n-2',
    category: 'personal',
    type: 'payment',
    title: 'Nhắc thanh toán đơn hàng',
    message: 'Đơn #12954 còn 623.455đ cần thanh toán trước ngày 18/06/2026.',
    createdAt: '2026-06-14T16:45:00',
    isRead: false,
  },
  {
    id: 'n-3',
    category: 'personal',
    type: 'delivery',
    title: 'Kiện hàng sẵn sàng giao',
    message: 'Kiện hàng #PKG-8821 của đơn #12890 đã sẵn sàng giao tại kho.',
    createdAt: '2026-06-13T11:20:00',
    isRead: false,
  },
  {
    id: 'n-4',
    category: 'personal',
    type: 'order',
    title: 'Đơn hàng đang xử lý',
    message: 'Đơn #12811 đã được xác nhận và đang trong quá trình mua hàng.',
    createdAt: '2026-06-12T08:10:00',
    isRead: true,
  },
  {
    id: 'n-6',
    category: 'personal',
    type: 'payment',
    title: 'Nạp tiền thành công',
    message: 'Bạn vừa nạp 500.000đ vào ví Tosol. Số dư hiện tại: 500.000đ.',
    createdAt: '2026-06-08T19:25:00',
    isRead: true,
  },
  {
    id: 'n-5',
    category: 'system',
    type: 'system',
    title: 'Cập nhật chính sách dịch vụ',
    message: 'Phong Đà Logistics đã cập nhật quy định đóng gỗ và bảo hiểm hàng hóa.',
    createdAt: '2026-06-10T14:00:00',
    isRead: true,
  },
  {
    id: 'n-7',
    category: 'system',
    type: 'system',
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ bảo trì từ 00:00 - 02:00 ngày 20/06/2026. Vui lòng lên đơn sớm hơn.',
    createdAt: '2026-06-09T10:00:00',
    isRead: false,
  },
];
