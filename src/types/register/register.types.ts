export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResult {
  userId: string;
  username: string;
  email: string;
}

export type RegisterStatus = 'idle' | 'loading' | 'success' | 'error';
