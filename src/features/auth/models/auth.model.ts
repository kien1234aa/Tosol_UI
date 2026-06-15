/** Domain models for the authentication feature. */

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';
