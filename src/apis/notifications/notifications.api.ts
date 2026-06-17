import { getJsonPaginated, postJson, postJsonAction, type PaginationMeta } from '@/src/apis/http';
import { apiEndpoints, notificationsPageSize } from '@/src/configs/api';
import type {
  NotificationApiItem,
  NotificationListParams,
} from '@/src/types/notifications/notifications.types';

export interface INotificationsService {
  list(
    params?: NotificationListParams,
  ): Promise<{ data: NotificationApiItem[]; meta: PaginationMeta }>;
  markAsRead(notificationId: string): Promise<NotificationApiItem>;
  markAllAsRead(): Promise<void>;
}

class HttpNotificationsService implements INotificationsService {
  async list(
    params: NotificationListParams = {},
  ): Promise<{ data: NotificationApiItem[]; meta: PaginationMeta }> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? notificationsPageSize;

    return getJsonPaginated<NotificationApiItem[]>(apiEndpoints.notifications, {
      page,
      per_page: perPage,
    });
  }

  async markAsRead(notificationId: string): Promise<NotificationApiItem> {
    const id = notificationId.trim();

    if (!id) {
      throw new Error('Thiếu id thông báo');
    }

    return postJson<NotificationApiItem>(
      `${apiEndpoints.notifications}/${encodeURIComponent(id)}/read`,
      {},
    );
  }

  async markAllAsRead(): Promise<void> {
    await postJsonAction(`${apiEndpoints.notifications}/read-all`, {});
  }
}

export const notificationsService: INotificationsService =
  new HttpNotificationsService();
