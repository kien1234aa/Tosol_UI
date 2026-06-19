import {
  buildQueryString,
  getRetryDelayMs,
  parseRetryAfterMs,
  resolveApiErrorCode,
} from '@/src/helpers/api/http.helpers';
import {
  computeTokenExpiresAt,
  isTokenExpired,
} from '@/src/helpers/api/session.helpers';
import { TOKEN_EXPIRY_BUFFER_SECONDS } from '@/src/configs/api/http.constants';

describe('session.helpers', () => {
  it('computes token expiry with safety buffer', () => {
    const issuedAt = 1_000_000;
    const expiresAt = computeTokenExpiresAt(3600, issuedAt);

    expect(expiresAt).toBe(
      issuedAt + 3600 * 1000 - TOKEN_EXPIRY_BUFFER_SECONDS * 1000,
    );
  });

  it('detects expired tokens', () => {
    expect(isTokenExpired(500, 1_000)).toBe(true);
    expect(isTokenExpired(2_000, 1_000)).toBe(false);
    expect(isTokenExpired(null)).toBe(false);
  });
});

describe('http.helpers', () => {
  it('builds query strings and skips empty values', () => {
    expect(
      buildQueryString({
        page: 1,
        search: 'abc',
        empty: '',
        missing: undefined,
        nil: null,
      }),
    ).toBe('?page=1&search=abc&empty=');
  });

  it('maps HTTP statuses to error codes', () => {
    expect(resolveApiErrorCode(401)).toBe('UNAUTHORIZED');
    expect(resolveApiErrorCode(429)).toBe('RATE_LIMITED');
    expect(resolveApiErrorCode(500)).toBe('SERVER');
  });

  it('parses Retry-After seconds header', () => {
    expect(parseRetryAfterMs('2')).toBe(2000);
  });

  it('applies exponential retry delay', () => {
    expect(getRetryDelayMs(1, 500)).toBe(500);
    expect(getRetryDelayMs(3, 500)).toBe(2000);
    expect(getRetryDelayMs(2, 500, 1500)).toBe(1500);
  });
});
