import { useCallback, useMemo, useState } from 'react';
import {
  isForgotPasswordFormValid,
  validateForgotPasswordForm,
  type ForgotPasswordValidationErrors,
} from '@/src/helpers/forgotPassword/validation';
import {
  selectForgotPasswordError,
  selectIsForgotPasswordSubmitting,
} from '@/src/redux/forgotPassword/forgotPasswordSelectors';
import {
  clearForgotPasswordError,
  resetForgotPasswordState,
} from '@/src/redux/forgotPassword/forgotPasswordSlice';
import { forgotPasswordThunk } from '@/src/redux/forgotPassword/forgotPasswordThunks';
import { useAppDispatch } from '../common/useAppDispatch';
import { useAppSelector } from '../common/useAppSelector';

export interface UseForgotPasswordFormResult {
  email: string;
  isSubmitting: boolean;
  errors: ForgotPasswordValidationErrors;
  serverError: string | null;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function useForgotPasswordForm(): UseForgotPasswordFormResult {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsForgotPasswordSubmitting);
  const serverError = useAppSelector(selectForgotPasswordError);

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = useMemo<ForgotPasswordValidationErrors>(
    () => (touched ? validateForgotPasswordForm(email) : {}),
    [touched, email],
  );

  const onChangeEmail = useCallback(
    (value: string) => {
      setEmail(value);
      if (serverError) {
        dispatch(clearForgotPasswordError());
      }
    },
    [dispatch, serverError],
  );

  const onReset = useCallback(() => {
    setEmail('');
    setTouched(false);
    dispatch(resetForgotPasswordState());
  }, [dispatch]);

  const onSubmit = useCallback(() => {
    setTouched(true);
    const validationErrors = validateForgotPasswordForm(email);

    if (!isForgotPasswordFormValid(validationErrors)) {
      return;
    }

    dispatch(forgotPasswordThunk({ email: email.trim() }));
  }, [dispatch, email]);

  return {
    email,
    isSubmitting,
    errors,
    serverError,
    onChangeEmail,
    onSubmit,
    onReset,
  };
}
