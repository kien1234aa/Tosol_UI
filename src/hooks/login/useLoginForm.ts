import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isFormValid,
  validateLoginForm,
  type LoginValidationErrors,
} from '@/src/helpers';
import { mapLoginApiFieldErrors } from '@/src/helpers/api/apiError.helpers';
import {
  selectAuthError,
  selectAuthFieldErrors,
  selectIsAuthenticating,
  selectRememberMe,
} from '@/src/redux/login/authSelectors';
import { clearAuthError, setRememberMe } from '@/src/redux/login/authSlice';
import { loginThunk } from '@/src/redux/login/authThunks';
import { loginCredentialsStorage } from '@/src/storage';
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
  const serverFieldErrors = useAppSelector(selectAuthFieldErrors);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loginCredentialsStorage.load().then(stored => {
      if (cancelled || !stored) {
        return;
      }

      setUsername(stored.username);
      setPassword(stored.password);
      dispatch(setRememberMe(true));
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const errors = useMemo<LoginValidationErrors>(() => {
    const clientErrors = touched ? validateLoginForm(username, password) : {};
    const apiFieldErrors = mapLoginApiFieldErrors(serverFieldErrors);

    return {
      ...clientErrors,
      ...apiFieldErrors,
    };
  }, [password, serverFieldErrors, touched, username]);

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

      if (!value) {
        void loginCredentialsStorage.clear();
      }
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
