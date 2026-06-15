import { useCallback, useEffect, useMemo, useState } from 'react';
import { personalInfoCopy } from '@/src/configs/profile';
import {
  isPersonalInfoValid,
  toPersonalInfoFormValues,
  validatePersonalInfoForm,
} from '@/src/helpers/profile';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { updateUserProfile, selectUserProfile } from '@/src/redux/profile';
import type {
  PersonalInfoFormValues,
  PersonalInfoValidationErrors,
} from '@/src/types/profile/profile.types';

export interface UsePersonalInfoResult {
  values: PersonalInfoFormValues;
  errors: PersonalInfoValidationErrors;
  isDirty: boolean;
  onChangeField: <K extends keyof PersonalInfoFormValues>(
    field: K,
    value: PersonalInfoFormValues[K],
  ) => void;
  onSave: () => boolean;
}

export function usePersonalInfo(): UsePersonalInfoResult {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);
  const [values, setValues] = useState<PersonalInfoFormValues>(() =>
    toPersonalInfoFormValues(profile),
  );
  const [errors, setErrors] = useState<PersonalInfoValidationErrors>({});

  useEffect(() => {
    setValues(toPersonalInfoFormValues(profile));
    setErrors({});
  }, [profile]);

  const baselineValues = useMemo(
    () => toPersonalInfoFormValues(profile),
    [profile],
  );

  const isDirty = useMemo(
    () =>
      values.fullName !== baselineValues.fullName ||
      values.email !== baselineValues.email ||
      values.phone !== baselineValues.phone ||
      values.address !== baselineValues.address,
    [baselineValues, values],
  );

  const onChangeField = useCallback(
    <K extends keyof PersonalInfoFormValues>(
      field: K,
      value: PersonalInfoFormValues[K],
    ) => {
      setValues(current => ({ ...current, [field]: value }));
      setErrors(current => {
        if (!current[field as keyof PersonalInfoValidationErrors]) {
          return current;
        }
        const next = { ...current };
        delete next[field as keyof PersonalInfoValidationErrors];
        return next;
      });
    },
    [],
  );

  const onSave = useCallback(() => {
    const nextErrors = validatePersonalInfoForm(values);
    setErrors(nextErrors);

    if (!isPersonalInfoValid(nextErrors)) {
      return false;
    }

    dispatch(
      updateUserProfile({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        username: values.username,
      }),
    );

    return true;
  }, [dispatch, values]);

  return {
    values,
    errors,
    isDirty,
    onChangeField,
    onSave,
  };
}
