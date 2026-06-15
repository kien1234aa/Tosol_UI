import {
  registerRules,
  registerValidationMessages,
} from '@/src/configs/register/register.constants';

export interface RegisterValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegisterForm(
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
): RegisterValidationErrors {
  const errors: RegisterValidationErrors = {};

  if (!username.trim()) {
    errors.username = registerValidationMessages.usernameRequired;
  }

  if (!email.trim()) {
    errors.email = registerValidationMessages.emailRequired;
  } else if (!registerRules.emailPattern.test(email.trim())) {
    errors.email = registerValidationMessages.emailInvalid;
  }

  if (!password) {
    errors.password = registerValidationMessages.passwordRequired;
  } else if (password.length < registerRules.minPasswordLength) {
    errors.password = registerValidationMessages.passwordTooShort;
  }

  if (!confirmPassword) {
    errors.confirmPassword = registerValidationMessages.confirmPasswordRequired;
  } else if (confirmPassword !== password) {
    errors.confirmPassword = registerValidationMessages.confirmPasswordMismatch;
  }

  return errors;
}

export function isRegisterFormValid(errors: RegisterValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
