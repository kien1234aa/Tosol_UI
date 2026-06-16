import api from '@shared/services/api';
import type { MeApiResponse, UserInfo } from './userResponseTypes';

export async function getUserInfo(): Promise<UserInfo> {
  const response = await api.get<MeApiResponse>('/me');
  const body = response.data;
  if (!body.success || !body.data) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai thong tin nguoi dung',
    );
  }
  return body.data;
}
