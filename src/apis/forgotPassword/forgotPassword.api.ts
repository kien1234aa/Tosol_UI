import type {
  ForgotPasswordRequest,
  ForgotPasswordResult,
} from '@/src/types/forgotPassword/forgotPassword.types';

export interface IForgotPasswordService {
  requestReset(request: ForgotPasswordRequest): Promise<ForgotPasswordResult>;
}

const MOCK_LATENCY_MS = 900;

class MockForgotPasswordService implements IForgotPasswordService {
  async requestReset(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResult> {
    await new Promise<void>(resolve =>
      setTimeout(() => resolve(), MOCK_LATENCY_MS),
    );

    if (request.email.toLowerCase() === 'unknown@example.com') {
      throw new Error('Email chưa được đăng ký');
    }

    return {
      email: request.email,
      message: 'Mã xác nhận đã được gửi đến email của bạn',
    };
  }
}

export const forgotPasswordService: IForgotPasswordService =
  new MockForgotPasswordService();
