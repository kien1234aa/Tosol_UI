import { useCallback, useMemo, useState } from 'react';
import { isFormValid, validateLoginForm, type LoginValidationErrors } from '@/src/helpers';
import {
  selectAuthError,
  selectIsAuthenticating,
  selectRememberMe,
} from '@/src/redux/login/authSelectors';
import { clearAuthError, setRememberMe } from '@/src/redux/login/authSlice';
import { loginThunk } from '@/src/redux/login/authThunks';
import { useAppDispatch } from '../common/useAppDispatch';
import { useAppSelector } from '../common/useAppSelector';

export interface UseLoginFormResult {
  username: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  isSubmitting: boolean;
  errors: LoginValidationErrors;
  serverError: string | null;
  onChangeUsername: (value: string) => void;
  onChangePassword: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleRememberMe: (value: boolean) => void;
  onSubmit: () => void;
}

/**
 * Encapsulates all login form behavior: local field state, validation,
 * and Redux dispatch. The screen/components stay purely presentational.
 */
export function useLoginForm(): UseLoginFormResult {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsAuthenticating);
  const rememberMe = useAppSelector(selectRememberMe);
  const serverError = useAppSelector(selectAuthError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = useMemo<LoginValidationErrors>(
    () => (touched ? validateLoginForm(username, password) : {}),
    [touched, username, password],
  );

  const onChangeUsername = useCallback(
    (value: string) => {
      setUsername(value);
      if (serverError) {
        dispatch(clearAuthError());
      }
    },
    [dispatch, serverError],
  );

  const onChangePassword = useCallback(
    (value: string) => {
      setPassword(value);
      if (serverError) {
        dispatch(clearAuthError());
      }
    },
    [dispatch, serverError],
  );

  const onToggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const onToggleRememberMe = useCallback(
    (value: boolean) => {
      dispatch(setRememberMe(value));
    },
    [dispatch],
  );

  const onSubmit = useCallback(() => {
    setTouched(true);
    const validationErrors = validateLoginForm(username, password);

    if (!isFormValid(validationErrors)) {
      return;
    }

    dispatch(loginThunk({ username, password, rememberMe }));
  }, [dispatch, username, password, rememberMe]);

  return {
    username,
    password,
    showPassword,
    rememberMe,
    isSubmitting,
    errors,
    serverError,
    onChangeUsername,
    onChangePassword,
    onToggleShowPassword,
    onToggleRememberMe,
    onSubmit,
  };
}
