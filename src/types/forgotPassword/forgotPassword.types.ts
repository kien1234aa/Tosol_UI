export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResult {
  email: string;
  message: string;
}

export type ForgotPasswordStatus = 'idle' | 'loading' | 'success' | 'error';
