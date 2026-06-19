import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { showFeatureInDevelopmentAlert } from '@/src/helpers/app';

/** Alerts on screen focus and returns a callback to block mock feature actions. */
export function useFeatureInDevelopmentNotice(): () => void {
  const notify = useCallback(() => {
    showFeatureInDevelopmentAlert();
  }, []);

  useFocusEffect(
    useCallback(() => {
      notify();
    }, [notify]),
  );

  return notify;
}
