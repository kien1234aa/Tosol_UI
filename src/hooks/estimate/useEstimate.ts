import { useCallback, useState } from 'react';
import { estimateCopy } from '@/src/configs/estimate';
import { computeEstimate } from '@/src/helpers/estimate';
import type {
  EstimateErrors,
  EstimateForm,
  EstimateMode,
  EstimateResult,
} from '@/src/types/estimate/estimate.types';

const EMPTY_FORM: EstimateForm = {
  priceCny: '',
  weightKg: '',
  lengthCm: '',
  widthCm: '',
  heightCm: '',
};

export interface UseEstimateResult {
  mode: EstimateMode;
  form: EstimateForm;
  errors: EstimateErrors;
  result: EstimateResult | null;
  setMode: (mode: EstimateMode) => void;
  setField: (field: keyof EstimateForm, value: string) => void;
  submit: () => void;
}

function sanitizeDecimal(value: string): string {
  return value.replace(/[^0-9.,]/g, '');
}

function isPositive(value: string): boolean {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0;
}

export function useEstimate(): UseEstimateResult {
  const [mode, setModeState] = useState<EstimateMode>('buyForMe');
  const [form, setForm] = useState<EstimateForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<EstimateErrors>({});
  const [result, setResult] = useState<EstimateResult | null>(null);

  const setMode = useCallback((next: EstimateMode) => {
    setModeState(next);
    setForm(EMPTY_FORM);
    setErrors({});
    setResult(null);
  }, []);

  const setField = useCallback(
    (field: keyof EstimateForm, value: string) => {
      setForm(prev => ({ ...prev, [field]: sanitizeDecimal(value) }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
      setResult(null);
    },
    [],
  );

  const submit = useCallback(() => {
    const nextErrors: EstimateErrors = {};

    if (mode === 'buyForMe' && !isPositive(form.priceCny)) {
      nextErrors.priceCny = estimateCopy.priceRequired;
    }
    if (!isPositive(form.weightKg)) {
      nextErrors.weightKg = estimateCopy.weightRequired;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setResult(null);
      return;
    }

    setErrors({});
    setResult(computeEstimate(mode, form));
  }, [form, mode]);

  return { mode, form, errors, result, setMode, setField, submit };
}
