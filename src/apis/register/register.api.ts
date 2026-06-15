import type {
  RegisterCredentials,
  RegisterResult,
} from '@/src/types/register/register.types';

export interface IRegisterService {
  register(credentials: RegisterCredentials): Promise<RegisterResult>;
}

const MOCK_LATENCY_MS = 900;

class MockRegisterService implements IRegisterService {
  async register(credentials: RegisterCredentials): Promise<RegisterResult> {
    await new Promise<void>(resolve =>
      setTimeout(() => resolve(), MOCK_LATENCY_MS),
    );

    if (credentials.username.toLowerCase() === 'existing') {
      throw new Error('Tên đăng nhập đã tồn tại');
    }

    return {
      userId: `u-${Date.now()}`,
      username: credentials.username,
      email: credentials.email,
    };
  }
}

export const registerService: IRegisterService = new MockRegisterService();
