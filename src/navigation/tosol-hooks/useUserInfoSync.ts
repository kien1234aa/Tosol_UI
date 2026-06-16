import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { fetchUserInfo } from '@services/auth/userSlice';

const REFETCH_THROTTLE_MS = 12_000;

/**
 * Đồng bộ `/me` (role, quyền, thông tin user) trong 2 tình huống:
 *  1. Lần đầu sau khi hydrate + login (hoặc đổi tài khoản).
 *  2. App quay lại foreground sau ≥ 12 giây (throttle tránh spam API).
 */
export function useUserInfoSync() {
  const dispatch = useAppDispatch();
  const { hydrated, isLoggedIn, user } = useAppSelector(state => state.auth);
  const lastRefetchMs = useRef(0);

  // Initial sync on login / account switch
  useEffect(() => {
    if (!hydrated || !isLoggedIn) {
      return;
    }
    dispatch(fetchUserInfo()).catch(() => {});
  }, [dispatch, hydrated, isLoggedIn, user?.uuid]);

  // Foreground resume sync (throttled)
  useEffect(() => {
    if (!hydrated || !isLoggedIn) {
      return;
    }
    const onChange = (next: AppStateStatus) => {
      if (next !== 'active') {
        return;
      }
      const now = Date.now();
      if (now - lastRefetchMs.current < REFETCH_THROTTLE_MS) {
        return;
      }
      lastRefetchMs.current = now;
      dispatch(fetchUserInfo()).catch(() => {});
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [dispatch, hydrated, isLoggedIn]);
}
