import { useEffect } from 'react';
import { store } from '@app/store';
import { logout } from '@services/auth/authSlice';
import { registerApiUnauthorizedHandler } from '@shared/services/api';

/**
 * Đăng ký handler cho lỗi 401 từ axios interceptor.
 * Khi API trả về Unauthorized → tự động dispatch logout().
 * Cleanup khi component unmount.
 */
export function useApiUnauthorizedHandler() {
  useEffect(() => {
    registerApiUnauthorizedHandler(() => {
      store.dispatch(logout());
    });
    return () => {
      registerApiUnauthorizedHandler(undefined);
    };
  }, []);
}
