import {
  authRules,
  authValidationMessages,
} from '@/src/configs/login/auth.constants';
import {
  changePasswordCopy,
  changePasswordRules,
} from '@/src/configs/profile';
import type {
  ChangePasswordFormValues,
  ChangePasswordValidationErrors,
} from '@/src/types/profile/profile.types';

export function validateChangePasswordForm(
  values: ChangePasswordFormValues,
): ChangePasswordValidationErrors {
  const errors: ChangePasswordValidationErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = changePasswordCopy.currentPasswordRequired;
  } else if (values.currentPassword === changePasswordRules.mockWrongPassword) {
    errors.currentPassword = changePasswordCopy.currentPasswordIncorrect;
  }

  if (!values.newPassword) {
    errors.newPassword = changePasswordCopy.newPasswordRequired;
  } else if (values.newPassword.length < authRules.minPasswordLength) {
    errors.newPassword = authValidationMessages.passwordTooShort;
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = changePasswordCopy.newPasswordSameAsCurrent;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = changePasswordCopy.confirmPasswordRequired;
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = changePasswordCopy.confirmPasswordMismatch;
  }

  return errors;
}

export function isChangePasswordValid(
  errors: ChangePasswordValidationErrors,
): boolean {
  return Object.keys(errors).length === 0;
}
