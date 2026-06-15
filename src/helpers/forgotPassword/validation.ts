import {
  forgotPasswordRules,
  forgotPasswordValidationMessages,
} from '@/src/configs/forgotPassword/forgotPassword.constants';

export interface ForgotPasswordValidationErrors {
  email?: string;
}

export function validateForgotPasswordForm(
  email: string,
): ForgotPasswordValidationErrors {
  const errors: ForgotPasswordValidationErrors = {};

  if (!email.trim()) {
    errors.email = forgotPasswordValidationMessages.emailRequired;
  } else if (!forgotPasswordRules.emailPattern.test(email.trim())) {
    errors.email = forgotPasswordValidationMessages.emailInvalid;
  }

  return errors;
}

export function isForgotPasswordFormValid(
  errors: ForgotPasswordValidationErrors,
): boolean {
  return Object.keys(errors).length === 0;
}
