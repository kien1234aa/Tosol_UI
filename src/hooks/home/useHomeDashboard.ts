import { useMemo } from 'react';
import { homeCopy } from '@/src/configs/home';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectAuthUser } from '@/src/redux/login/authSelectors';
import { selectHomeDashboardBadges } from '@/src/redux/home/homeSelectors';
import type { HomeBadges } from '@/src/types/home/home.types';

export interface UseHomeDashboardResult {
  /** Name rendered in the greeting header. */
  displayName: string;
  /** Notification badge counts keyed by dashboard action. */
  badges: HomeBadges;
}

/**
 * Reads the authenticated user + dashboard badges from the store and derives
 * the greeting name. Pure data hook — navigation lives in the screen so it
 * mirrors the login flow conventions.
 */
export function useHomeDashboard(): UseHomeDashboardResult {
  const user = useAppSelector(selectAuthUser);
  const badges = useAppSelector(selectHomeDashboardBadges);

  const displayName = useMemo(
    () => user?.displayName || user?.username || homeCopy.fallbackName,
    [user],
  );

  return { displayName, badges };
}
