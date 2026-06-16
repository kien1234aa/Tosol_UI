import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosHeaders, isAxiosError } from 'axios';

const BASE_URL = 'https://tosol-api-v2-j4flv6af.on-forge.com/api/v1';
const STORAGE_TOKEN_KEY = 'accessToken';

let onUnauthorized: (() => void) | undefined;
let unauthorizedGuard = false;

/** Goi tu App sau khi co store.dispatch (tranh vong import store <-> api). */
export function registerApiUnauthorizedHandler(
  handler: (() => void) | undefined,
) {
  onUnauthorized = handler;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const syncApiClientAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  response => response,
  async (error: unknown) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      onUnauthorized &&
      !unauthorizedGuard
    ) {
      const url = String(error.config?.url ?? '');
      if (url.includes('/login')) {
        return Promise.reject(error);
      }
      const token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
      if (token) {
        unauthorizedGuard = true;
        try {
          onUnauthorized();
        } finally {
          setTimeout(() => {
            unauthorizedGuard = false;
          }, 1500);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
