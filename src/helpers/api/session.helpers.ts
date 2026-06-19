import { TOKEN_EXPIRY_BUFFER_SECONDS } from '@/src/configs/api/http.constants';

/** Absolute expiry timestamp (ms) with a safety buffer before server expiry. */
export function computeTokenExpiresAt(
  expiresInSeconds: number,
  issuedAtMs: number = Date.now(),
): number {
  const bufferMs = TOKEN_EXPIRY_BUFFER_SECONDS * 1000;
  return issuedAtMs + expiresInSeconds * 1000 - bufferMs;
}

export function isTokenExpired(
  expiresAtMs: number | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (expiresAtMs == null) {
    return false;
  }

  return nowMs >= expiresAtMs;
}
