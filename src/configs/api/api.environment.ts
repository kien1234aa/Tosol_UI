/** Production API base URL — app always targets this environment. */
export const PRODUCTION_API_BASE_URL =
  'https://api-tosol.tomonisolution.com/api/v1';

export function getApiBaseUrl(): string {
  return PRODUCTION_API_BASE_URL;
}
