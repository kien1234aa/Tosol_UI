import { useEffect } from 'react';
import { useAppDispatch } from '@app/hooks';
import { restoreSession } from '@services/auth/authSlice';

/** Khôi phục session từ AsyncStorage một lần khi app khởi động. */
export function useSessionRestore() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
}
