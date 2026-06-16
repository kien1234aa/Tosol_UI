import { postJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type {
  AuthSession,
  LoginApiData,
  LoginApiUser,
  LoginCredentials,
} from '@/src/types/login/auth.types';

/**
 * Auth service abstraction. Swap this implementation for a real HTTP client
 * (fetch/axios) without touching the slice, hooks, or UI — depend on the
 * interface, not the concrete network layer (Dependency Inversion).
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
}

function mapLoginUser(user: LoginApiUser): AuthSession['user'] {
  return {
    id: String(user.id),
    uuid: user.uuid,
    username: user.email,
    displayName: user.name,
    email: user.email,
    role: user.role,
    isTosolUser: user.is_tosol_user,
    isSellerUser: user.is_seller_user,
    isActive: user.is_active,
    lastLoginAt: user.last_login_at,
    seller: user.seller,
    warehouses: user.warehouses,
    currentWarehouseId: user.current_warehouse_id,
    hasMultipleWarehouses: user.has_multiple_warehouses,
  };
}

function mapLoginResponse(data: LoginApiData): AuthSession {
  return {
    user: mapLoginUser(data.user),
    token: data.token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
}

class HttpAuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const data = await postJson<LoginApiData>(apiEndpoints.login, {
      email: credentials.username.trim(),
      password: credentials.password,
      remember: credentials.rememberMe,
    });

    return mapLoginResponse(data);
  }
}

export const authService: IAuthService = new HttpAuthService();
