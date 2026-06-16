import type { ApiNotification } from '@services/system/notificationsApi';

/** Tham số stack — toàn primitive / string để tránh cảnh báo serialization. */
export type NotificationDetailParams = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
  type_label?: string;
  category?: string;
  severity?: string;
  icon: string;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  /** JSON pretty-print của `data` (nếu có). */
  dataJson?: string;
};

export function apiNotificationToDetailParams(
  n: ApiNotification,
): NotificationDetailParams {
  let dataJson: string | undefined;
  try {
    if (
      n.data != null &&
      typeof n.data === 'object' &&
      Object.keys(n.data).length > 0
    ) {
      dataJson = JSON.stringify(n.data, null, 2);
    }
  } catch {
    dataJson = undefined;
  }
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    created_at: n.created_at,
    type: n.type,
    type_label: n.type_label,
    category: n.category,
    severity: n.severity,
    icon: n.icon,
    action_url: n.action_url,
    is_read: n.is_read,
    read_at: n.read_at,
    dataJson,
  };
}
