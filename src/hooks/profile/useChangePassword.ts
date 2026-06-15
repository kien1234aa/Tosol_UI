import { useCallback, useState } from 'react';
import { changePasswordService, toChangePasswordPayload } from '@/src/apis/profile';
import {
  isChangePasswordValid,
  validateChangePasswordForm,
} from '@/src/helpers/profile';
import type { ChangePasswordValidationErrors } from '@/src/types/profile/profile.types';

export interface UseChangePasswordResult {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  errors: ChangePasswordValidationErrors;
  serverError: string | null;
  isSubmitting: boolean;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onToggleShowCurrentPassword: () => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onSubmit: () => Promise<boolean>;
}

export function useChangePassword(): UseChangePasswordResult {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ChangePasswordValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = useCallback(
    (field: keyof ChangePasswordValidationErrors) => {
      setErrors(current => {
        if (!current[field]) {
          return current;
        }
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const onChangeCurrentPassword = useCallback(
    (value: string) => {
      setCurrentPassword(value);
      setServerError(null);
      clearFieldError('currentPassword');
    },
    [clearFieldError],
  );

  const onChangeNewPassword = useCallback(
    (value: string) => {
      setNewPassword(value);
      setServerError(null);
      clearFieldError('newPassword');
    },
    [clearFieldError],
  );

  const onChangeConfirmPassword = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      setServerError(null);
      clearFieldError('confirmPassword');
    },
    [clearFieldError],
  );

  const onToggleShowCurrentPassword = useCallback(() => {
    setShowCurrentPassword(current => !current);
  }, []);

  const onToggleShowNewPassword = useCallback(() => {
    setShowNewPassword(current => !current);
  }, []);

  const onToggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(current => !current);
  }, []);

  const onSubmit = useCallback(async () => {
    const values = {
      currentPassword,
      newPassword,
      confirmPassword,
    };
    const nextErrors = validateChangePasswordForm(values);
    setErrors(nextErrors);

    if (!isChangePasswordValid(nextErrors)) {
      return false;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await changePasswordService.changePassword(toChangePasswordPayload(values));
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể thay đổi mật khẩu. Vui lòng thử lại.';
      setServerError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, currentPassword, newPassword]);

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    errors,
    serverError,
    isSubmitting,
    onChangeCurrentPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    onToggleShowCurrentPassword,
    onToggleShowNewPassword,
    onToggleShowConfirmPassword,
    onSubmit,
  };
}
