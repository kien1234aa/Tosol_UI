import { isAxiosError } from 'axios';
import api from '@shared/services/api';

export type ApiNotification = {
  id: string;
  type: string;
  type_label?: string;
  category?: string;
  severity?: string;
  icon: string;
  title: string;
  message: string;
  action_url: string | null;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at?: string;
};

export type NotificationsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type NotificationsListResponse = {
  success: boolean;
  message?: string;
  data: ApiNotification[];
  meta?: NotificationsListMeta;
};

export async function fetchNotificationsList(params?: {
  per_page?: number;
  page?: number;
}): Promise<NotificationsListResponse> {
  const per_page = params?.per_page ?? 20;
  const page = params?.page ?? 1;
  try {
    const { data } = await api.get<NotificationsListResponse>(
      '/notifications',
      {
        params: { per_page, page },
      },
    );
    return data;
  } catch (e: unknown) {
    if (isAxiosError(e)) {
      const msg =
        (typeof e.response?.data === 'object' &&
          e.response?.data != null &&
          'message' in e.response.data &&
          typeof (e.response.data as { message?: unknown }).message ===
            'string' &&
          (e.response.data as { message: string }).message) ||
        e.message;
      throw new Error(msg || 'Request failed');
    }
    throw e instanceof Error ? e : new Error('Request failed');
  }
}
