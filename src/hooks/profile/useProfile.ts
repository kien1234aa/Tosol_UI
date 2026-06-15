import { useMemo } from 'react';
import { mockProfileBalanceVnd, profileCopy } from '@/src/configs/profile';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectUserProfile } from '@/src/redux/profile';

export interface UseProfileResult {
  displayName: string;
  balanceVnd: number;
}

export function useProfile(): UseProfileResult {
  const profile = useAppSelector(selectUserProfile);

  const displayName = useMemo(
    () => profile.fullName || profile.username || profileCopy.fallbackName,
    [profile.fullName, profile.username],
  );

  return {
    displayName,
    balanceVnd: mockProfileBalanceVnd,
  };
}
