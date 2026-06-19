import { postJsonMessage } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import { forgotPasswordCopy } from '@/src/configs/forgotPassword';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResult,
} from '@/src/types/forgotPassword/forgotPassword.types';

export interface IForgotPasswordService {
  requestReset(request: ForgotPasswordRequest): Promise<ForgotPasswordResult>;
}

class HttpForgotPasswordService implements IForgotPasswordService {
  async requestReset(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResult> {
    const email = request.email.trim();
    await postJsonMessage(apiEndpoints.forgotPassword, {
      email,
    });

    return {
      email,
      message: forgotPasswordCopy.successMessage,
    };
  }
}

export const forgotPasswordService: IForgotPasswordService =
  new HttpForgotPasswordService();
