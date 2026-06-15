import { authRules, authValidationMessages } from '@/src/core/constants';

export interface LoginValidationErrors {
  username?: string;
  password?: string;
}

/**
 * Pure validation function for the login form.
 * Returns a map of field -> message; an empty object means "valid".
 */
export function validateLoginForm(
  username: string,
  password: string,
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

  if (!username.trim()) {
    errors.username = authValidationMessages.usernameRequired;
  }

  if (!password) {
    errors.password = authValidationMessages.passwordRequired;
  } else if (password.length < authRules.minPasswordLength) {
    errors.password = authValidationMessages.passwordTooShort;
  }

  return errors;
}

export function isFormValid(errors: LoginValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
