import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { refreshCounters, resetCounters } from '@services/system/countersSlice';
import {
  resetSalesPrefetchFlag,
  scheduleSalesPrefetch,
} from '@features/sales/utils/salesPrefetch';

const POLL_INTERVAL_MS = 30_000;

/**
 * Polling GET /counters mỗi 30 giây khi đã đăng nhập.
 * Khi logout: dừng poll, reset counters, reset prefetch flag.
 * Khi login / đổi account: trigger ngay lập tức + schedule prefetch.
 */
export function useCountersPolling() {
  const dispatch = useAppDispatch();
  const { hydrated, isLoggedIn, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!isLoggedIn) {
      resetSalesPrefetchFlag();
      dispatch(resetCounters());
      return;
    }
    dispatch(refreshCounters()).catch(() => {});
    scheduleSalesPrefetch(dispatch);
    const id = setInterval(() => {
      dispatch(refreshCounters()).catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [dispatch, hydrated, isLoggedIn, user?.uuid]);
}
