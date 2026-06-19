import { ApiError } from '@/src/apis/http/ApiError';
import type { ApiFailurePayload } from '@/src/types/api/apiError.types';
import {
  localizeApiFieldErrors,
  localizeApiMessage,
} from './apiMessage.helpers';

type ApiErrorBody = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string | string[]>;
};

function flattenFieldErrors(
  errors: Record<string, string | string[]> | undefined,
): Record<string, string> {
  if (!errors) {
    return {};
  }

  return Object.entries(errors).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (Array.isArray(value) && value[0]) {
        acc[key] = value[0];
      } else if (typeof value === 'string' && value.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    },
    {},
  );
}

export function parseApiErrorBody(body: unknown): ApiFailurePayload {
  if (!body || typeof body !== 'object') {
    return { message: 'Yêu cầu thất bại', fieldErrors: {} };
  }

  const record = body as ApiErrorBody;
  const fieldErrors = localizeApiFieldErrors(flattenFieldErrors(record.errors));
  const topMessage =
    typeof record.message === 'string' ? record.message.trim() : '';
  const localizedTopMessage = localizeApiMessage(topMessage);
  const firstFieldError = Object.values(fieldErrors)[0];

  return {
    message: localizedTopMessage || firstFieldError || 'Yêu cầu thất bại',
    fieldErrors,
  };
}

export function toApiFailurePayload(
  error: unknown,
  fallbackMessage: string,
): ApiFailurePayload {
  if (error instanceof ApiError) {
    return {
      message: localizeApiMessage(error.message),
      fieldErrors: localizeApiFieldErrors(error.fieldErrors),
    };
  }

  if (error instanceof Error && error.message.trim()) {
    return {
      message: localizeApiMessage(error.message),
      fieldErrors: {},
    };
  }

  return { message: fallbackMessage, fieldErrors: {} };
}

export function mapLoginApiFieldErrors(
  fieldErrors: Record<string, string> | null | undefined,
): { username?: string; password?: string } {
  if (!fieldErrors) {
    return {};
  }

  const mapped: { username?: string; password?: string } = {};

  if (fieldErrors.email) {
    mapped.username = fieldErrors.email;
  }

  if (fieldErrors.password) {
    mapped.password = fieldErrors.password;
  }

  return mapped;
}
