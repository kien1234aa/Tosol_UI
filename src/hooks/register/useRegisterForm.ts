import { useCallback, useMemo, useState } from 'react';
import {
  isRegisterFormValid,
  validateRegisterForm,
  type RegisterValidationErrors,
} from '@/src/helpers/register/validation';
import {
  selectIsRegistering,
  selectRegisterError,
} from '@/src/redux/register/registerSelectors';
import {
  clearRegisterError,
  resetRegisterState,
} from '@/src/redux/register/registerSlice';
import { registerThunk } from '@/src/redux/register/registerThunks';
import { useAppDispatch } from '../common/useAppDispatch';
import { useAppSelector } from '../common/useAppSelector';

export interface UseRegisterFormResult {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isSubmitting: boolean;
  errors: RegisterValidationErrors;
  serverError: string | null;
  onChangeUsername: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function useRegisterForm(): UseRegisterFormResult {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsRegistering);
  const serverError = useAppSelector(selectRegisterError);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = useMemo<RegisterValidationErrors>(
    () =>
      touched
        ? validateRegisterForm(username, email, password, confirmPassword)
        : {},
    [touched, username, email, password, confirmPassword],
  );

  const clearServerErrorIfNeeded = useCallback(() => {
    if (serverError) {
      dispatch(clearRegisterError());
    }
  }, [dispatch, serverError]);

  const onChangeUsername = useCallback(
    (value: string) => {
      setUsername(value);
      clearServerErrorIfNeeded();
    },
    [clearServerErrorIfNeeded],
  );

  const onChangeEmail = useCallback(
    (value: string) => {
      setEmail(value);
      clearServerErrorIfNeeded();
    },
    [clearServerErrorIfNeeded],
  );

  const onChangePassword = useCallback(
    (value: string) => {
      setPassword(value);
      clearServerErrorIfNeeded();
    },
    [clearServerErrorIfNeeded],
  );

  const onChangeConfirmPassword = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      clearServerErrorIfNeeded();
    },
    [clearServerErrorIfNeeded],
  );

  const onToggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const onToggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const onReset = useCallback(() => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTouched(false);
    dispatch(resetRegisterState());
  }, [dispatch]);

  const onSubmit = useCallback(() => {
    setTouched(true);
    const validationErrors = validateRegisterForm(
      username,
      email,
      password,
      confirmPassword,
    );

    if (!isRegisterFormValid(validationErrors)) {
      return;
    }

    dispatch(
      registerThunk({
        username,
        email,
        password,
        confirmPassword,
      }),
    );
  }, [dispatch, username, email, password, confirmPassword]);

  return {
    username,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    isSubmitting,
    errors,
    serverError,
    onChangeUsername,
    onChangeEmail,
    onChangePassword,
    onChangeConfirmPassword,
    onToggleShowPassword,
    onToggleShowConfirmPassword,
    onSubmit,
    onReset,
  };
}
