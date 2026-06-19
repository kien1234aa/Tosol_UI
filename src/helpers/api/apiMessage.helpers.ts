import {
  API_FIELD_LABEL_MAP,
  API_MESSAGE_MAP,
} from '@/src/configs/api/apiMessages.constants';

function normalizeMessageKey(message: string): string {
  return message.trim().toLowerCase();
}

function localizeFieldLabel(field: string): string {
  const normalized = field.trim().toLowerCase().replace(/\s+/g, '_');
  return API_FIELD_LABEL_MAP[normalized] ?? field.replace(/_/g, ' ');
}

function localizeByPattern(message: string): string | null {
  const trimmed = message.trim();

  const andMoreErrorsMatch = trimmed.match(
    /^(.+?)\s*\(and\s+\d+\s+more\s+errors?\)\.?$/i,
  );
  if (andMoreErrorsMatch?.[1]) {
    return localizeApiMessage(andMoreErrorsMatch[1]);
  }

  const isRequiredMatch = trimmed.match(/^(.+?)\s+is\s+required\.?$/i);
  if (isRequiredMatch?.[1]) {
    return `Vui lòng nhập ${localizeFieldLabel(isRequiredMatch[1])}`;
  }

  const fieldRequiredMatch = trimmed.match(
    /^the\s+(.+?)\s+field\s+is\s+required\.?$/i,
  );
  if (fieldRequiredMatch?.[1]) {
    return `Vui lòng nhập ${localizeFieldLabel(fieldRequiredMatch[1])}`;
  }

  const validEmailMatch = trimmed.match(
    /^the\s+(.+?)\s+must\s+be\s+a\s+valid\s+email\s+address\.?$/i,
  );
  if (validEmailMatch?.[1]) {
    return `${localizeFieldLabel(validEmailMatch[1])} không hợp lệ`;
  }

  const minCharsMatch = trimmed.match(
    /^the\s+(.+?)\s+must\s+be\s+at\s+least\s+(\d+)\s+characters?\.?$/i,
  );
  if (minCharsMatch?.[1] && minCharsMatch[2]) {
    return `${localizeFieldLabel(minCharsMatch[1])} phải có ít nhất ${minCharsMatch[2]} ký tự`;
  }

  const passwordMismatchMatch = trimmed.match(
    /^the\s+password\s+confirmation\s+(does\s+not\s+match|must\s+match)\.?$/i,
  );
  if (passwordMismatchMatch) {
    return 'Mật khẩu không khớp';
  }

  const routeNotFoundMatch = trimmed.match(
    /^the\s+route\s+.+\s+could\s+not\s+be\s+found\.?$/i,
  );
  if (routeNotFoundMatch) {
    return 'Không tìm thấy dịch vụ. Vui lòng thử lại sau.';
  }

  return null;
}

export function localizeApiMessage(message: string | null | undefined): string {
  if (!message?.trim()) {
    return '';
  }

  const trimmed = message.trim();
  const mapped = API_MESSAGE_MAP[normalizeMessageKey(trimmed)];
  if (mapped) {
    return mapped;
  }

  const patternMatch = localizeByPattern(trimmed);
  if (patternMatch) {
    return patternMatch;
  }

  return trimmed;
}

export function localizeApiFieldErrors(
  fieldErrors: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!fieldErrors) {
    return {};
  }

  return Object.entries(fieldErrors).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      const localized = localizeApiMessage(value);
      if (localized) {
        acc[key] = localized;
      }
      return acc;
    },
    {},
  );
}
