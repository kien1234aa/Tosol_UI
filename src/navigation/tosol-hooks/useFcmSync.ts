import { useEffect } from 'react';
import { useAppSelector } from '@app/hooks';
import { syncFcmTokenWithBackend } from '@features/push/fcmSync';

/**
 * Đẩy FCM token lên backend sau mỗi lần đăng nhập hoặc đổi tài khoản.
 * Không có gì để cleanup — fire-and-forget.
 */
export function useFcmSync() {
  const { hydrated, isLoggedIn, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!hydrated || !isLoggedIn) {
      return;
    }
    syncFcmTokenWithBackend().catch(() => {});
  }, [hydrated, isLoggedIn, user?.uuid]);
}
