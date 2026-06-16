export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'notification';

export type ToastConfig = {
  type: ToastType;
  /** Optional bold title shown above the message (e.g. push notification title) */
  title?: string;
  message: string;
  /** ms, mặc định 3000 (success/info) hoặc 4000 (error/warning) */
  duration?: number;
};

export type ConfirmConfig = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** true = nút xác nhận màu đỏ (xóa, vô hiệu hóa...) */
  destructive?: boolean;
};

type ShowToastFn = (config: ToastConfig) => void;
type ShowConfirmFn = (config: ConfirmConfig) => Promise<boolean>;

function show(
  type: ToastType,
  message: string,
  duration: number,
  title?: string,
): void {
  _showToast?.({ type, title, message, duration });
}

let _showToast: ShowToastFn | null = null;
let _showConfirm: ShowConfirmFn | null = null;

/** Được gọi bởi AppFeedbackProvider khi mount/unmount. */
export function _registerFeedback(
  showToast: ShowToastFn | null,
  showConfirm: ShowConfirmFn | null,
) {
  _showToast = showToast;
  _showConfirm = showConfirm;
}

/**
 * Hiển thị toast notification styled theo theme ứng dụng.
 *
 * ```ts
 * toast.success('Đã lưu thành công');
 * toast.error('Không tải được dữ liệu');
 * toast.warning('Chú ý: trường bắt buộc');
 * toast.info('Đã cập nhật');
 * ```
 */
export const toast = {
  success: (message: string, duration = 3000, title?: string) =>
    show('success', message, duration, title),
  error: (message: string, duration = 4000, title?: string) =>
    show('error', message, duration, title),
  warning: (message: string, duration = 3500, title?: string) =>
    show('warning', message, duration, title),
  info: (message: string, duration = 3000, title?: string) =>
    show('info', message, duration, title),
  /** Banner in-app giống push notification (không dùng icon cảnh báo). */
  notification: (message: string, duration = 5000, title?: string) =>
    show('notification', message, duration, title),
};

/**
 * Hiển thị dialog xác nhận styled theo theme.
 * Trả về `true` nếu người dùng xác nhận, `false` nếu hủy.
 *
 * ```ts
 * const ok = await confirmDialog({
 *   title: 'Xóa khách hàng',
 *   message: 'Hành động này không thể hoàn tác.',
 *   confirmText: 'Xóa',
 *   destructive: true,
 * });
 * if (ok) { /* xóa *\/ }
 * ```
 */
export function confirmDialog(config: ConfirmConfig): Promise<boolean> {
  if (_showConfirm) {
    return _showConfirm(config);
  }
  return Promise.resolve(false);
}
