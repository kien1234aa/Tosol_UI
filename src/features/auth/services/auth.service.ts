import type { AuthSession, LoginCredentials } from '../models/auth.model';

/**
 * Auth service abstraction. Swap this implementation for a real HTTP client
 * (fetch/axios) without touching the slice, hooks, or UI — depend on the
 * interface, not the concrete network layer (Dependency Inversion).
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
}

const MOCK_LATENCY_MS = 900;

class MockAuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await new Promise<void>(resolve =>
      setTimeout(() => resolve(), MOCK_LATENCY_MS),
    );

    if (credentials.password === 'wrong') {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: 'u-1',
        username: credentials.username,
        displayName: credentials.username,
      },
    };
  }
}

export const authService: IAuthService = new MockAuthService();
