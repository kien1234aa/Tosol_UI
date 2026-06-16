import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { login } from '@services/auth/authSlice';
import { isFormValid, validateLoginForm, type LoginValidationErrors } from '@/src/helpers';

export interface UseSellerLoginFormResult {
  email: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  isSubmitting: boolean;
  errors: LoginValidationErrors;
  serverError: string | null;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleRememberMe: (value: boolean) => void;
  onSubmit: () => void;
}

export function useSellerLoginForm(): UseSellerLoginFormResult {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState(false);

  const errors = useMemo<LoginValidationErrors>(
    () => (touched ? validateLoginForm(email, password) : {}),
    [touched, email, password],
  );

  const onChangeEmail = useCallback((value: string) => {
    setEmail(value);
  }, []);

  const onChangePassword = useCallback((value: string) => {
    setPassword(value);
  }, []);

  const onToggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const onToggleRememberMe = useCallback((value: boolean) => {
    setRememberMe(value);
  }, []);

  const onSubmit = useCallback(() => {
    setTouched(true);
    const validationErrors = validateLoginForm(email, password);
    if (!isFormValid(validationErrors)) {
      return;
    }
    void dispatch(login({ email, password, remember: rememberMe }));
  }, [dispatch, email, password, rememberMe]);

  return {
    email,
    password,
    showPassword,
    rememberMe,
    isSubmitting: loading,
    errors,
    serverError: error,
    onChangeEmail,
    onChangePassword,
    onToggleShowPassword,
    onToggleRememberMe,
    onSubmit,
  };
}
