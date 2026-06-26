import { useCallback, useMemo } from 'react';
import { profileCopy } from '@/src/configs/profile';
import { formatUserRole } from '@/src/helpers/profile';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { fetchCurrentUserThunk } from '@/src/redux/login';
import { selectUserProfile } from '@/src/redux/profile';

export interface UseProfileResult {
  displayName: string;
  email: string;
  roleLabel: string;
  sellerName: string;
  reload: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);
  const authUser = useAppSelector(state => state.auth.user);

  const displayName = useMemo(
    () => profile.fullName || profile.username || profileCopy.fallbackName,
    [profile.fullName, profile.username],
  );

  const email = profile.email;
  const roleLabel = authUser ? formatUserRole(authUser.role) : '';
  const sellerName = authUser?.seller?.name?.trim() ?? '';

  const reload = useCallback(async () => {
    await dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  return {
    displayName,
    email,
    roleLabel,
    sellerName,
    reload,
  };
}
