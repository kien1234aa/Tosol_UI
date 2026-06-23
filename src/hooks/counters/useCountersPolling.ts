import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { countersPollIntervalMs } from '@/src/configs/counters/counters.constants';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { fetchCountersThunk } from '@/src/redux/counters';
import { selectIsAuthenticated } from '@/src/redux/login/authSelectors';

/**
 * Polls `/counters` every 30s while authenticated and foregrounded.
 * Refetches immediately when the app returns to the foreground.
 */
export function useCountersPolling(): void {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const poll = () => {
      if (appStateRef.current !== 'active') {
        return;
      }

      void dispatch(fetchCountersThunk());
    };

    poll();

    const intervalId = setInterval(poll, countersPollIntervalMs);
    const subscription = AppState.addEventListener('change', nextState => {
      const wasBackground = appStateRef.current !== 'active';
      appStateRef.current = nextState;

      if (wasBackground && nextState === 'active') {
        poll();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [dispatch, isAuthenticated]);
}
