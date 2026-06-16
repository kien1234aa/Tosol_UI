import api from '@shared/services/api';
import type { LoginApiResponse } from './loginResponseTypes';

export async function loginRequest(
  email: string,
  password: string,
  remember: boolean,
): Promise<LoginApiResponse> {
  const response = await api.post<LoginApiResponse>('/login', {
    email,
    password,
    remember,
  });
  return response.data;
}

export async function logoutRequest(): Promise<unknown> {
  const response = await api.post('/logout');
  return response.data;
}
