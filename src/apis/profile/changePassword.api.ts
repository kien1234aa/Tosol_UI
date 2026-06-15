import type { ChangePasswordFormValues } from '@/src/types/profile/profile.types';

const MOCK_LATENCY_MS = 800;

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IChangePasswordService {
  changePassword(payload: ChangePasswordPayload): Promise<void>;
}

class MockChangePasswordService implements IChangePasswordService {
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await new Promise<void>(resolve =>
      setTimeout(() => resolve(), MOCK_LATENCY_MS),
    );

    if (payload.currentPassword === 'wrong') {
      throw new Error('Mật khẩu hiện tại không đúng');
    }
  }
}

export const changePasswordService: IChangePasswordService =
  new MockChangePasswordService();

export function toChangePasswordPayload(
  values: ChangePasswordFormValues,
): ChangePasswordPayload {
  return {
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  };
}
