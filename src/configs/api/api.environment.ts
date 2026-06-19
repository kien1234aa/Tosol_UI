export type ApiEnvironment = 'development' | 'staging' | 'production';

const API_URLS: Record<ApiEnvironment, string> = {
  development: 'https://tosol-api-v2-j4flv6af.on-forge.com/api/v1',
  staging: 'https://tosol-api-v2-j4flv6af.on-forge.com/api/v1',
  production: 'https://api-tosol.tomonisolution.com/api/v1',
};

/** Override at build time when wiring dev/staging/prod flavors. */
let configuredEnvironment: ApiEnvironment | null = null;

export function setApiEnvironment(environment: ApiEnvironment): void {
  configuredEnvironment = environment;
}

/** Resolves the active API environment for the running build. */
export function resolveApiEnvironment(): ApiEnvironment {
  if (configuredEnvironment) {
    return configuredEnvironment;
  }

  return __DEV__ ? 'development' : 'production';
}

export function getApiBaseUrl(
  environment: ApiEnvironment = resolveApiEnvironment(),
): string {
  return API_URLS[environment];
}
