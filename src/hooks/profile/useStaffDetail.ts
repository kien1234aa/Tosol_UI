import { useCallback, useEffect, useState } from 'react';
import { usersService } from '@/src/apis/users';
import { staffDetailCopy } from '@/src/configs/profile';
import { mapStaffDetailApiToItem } from '@/src/helpers/profile/staff.helpers';
import type {
  ChangeStaffPasswordPayload,
  StaffDetailItem,
  UpdateStaffPayload,
} from '@/src/types/profile/staff.types';

export interface UseStaffDetailResult {
  staff: StaffDetailItem | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  updateStaff: (payload: UpdateStaffPayload) => Promise<boolean>;
  changePassword: (payload: ChangeStaffPasswordPayload) => Promise<boolean>;
  toggleActive: () => Promise<boolean>;
  deleteStaff: () => Promise<boolean>;
}

export function useStaffDetail(
  staffUuid: string,
  enabled: boolean,
): UseStaffDetailResult {
  const [staff, setStaff] = useState<StaffDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    setLoadError(null);

    try {
      const data = await usersService.getDetail(staffUuid);
      setStaff(mapStaffDetailApiToItem(data));
    } catch (error) {
      setStaff(null);
      setLoadError(
        error instanceof Error ? error.message : staffDetailCopy.loadError,
      );
    }
  }, [staffUuid]);

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadStaff();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadStaff]);

  const [prevEnabled, setPrevEnabled] = useState(enabled);
  const [prevStaffUuid, setPrevStaffUuid] = useState(staffUuid);

  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    if (!enabled) {
      setStaff(null);
      setLoadError(null);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }

  if (enabled && staffUuid !== prevStaffUuid) {
    setPrevStaffUuid(staffUuid);
    setStaff(null);
    setLoadError(null);
    setIsLoading(true);
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadStaff().finally(() => {
      setIsLoading(false);
    });
  }, [enabled, loadStaff]);

  const updateStaff = useCallback(
    async (payload: UpdateStaffPayload) => {
      setIsSubmitting(true);
      try {
        const data = await usersService.update(staffUuid, payload);
        setStaff(mapStaffDetailApiToItem(data));
        return true;
      } catch (error) {
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [staffUuid],
  );

  const changePassword = useCallback(
    async (payload: ChangeStaffPasswordPayload) => {
      setIsSubmitting(true);
      try {
        await usersService.changePassword(staffUuid, payload);
        return true;
      } catch (error) {
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [staffUuid],
  );

  const toggleActive = useCallback(async () => {
    if (!staff) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const data = staff.isActive
        ? await usersService.deactivate(staffUuid)
        : await usersService.activate(staffUuid);

      setStaff(current =>
        current
          ? {
              ...current,
              isActive: data.is_active,
            }
          : current,
      );
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [staff, staffUuid]);

  const deleteStaff = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await usersService.delete(staffUuid);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [staffUuid]);

  return {
    staff,
    isLoading,
    isRefreshing,
    isSubmitting,
    loadError,
    reload,
    updateStaff,
    changePassword,
    toggleActive,
    deleteStaff,
  };
}
