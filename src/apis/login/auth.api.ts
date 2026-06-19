import { getJson, postJson } from '@/src/apis/http';
import { apiEndpoints, userDetailInclude } from '@/src/configs/api';
import { normalizeWarehouseId } from '@/src/configs/warehouse';
import { computeTokenExpiresAt } from '@/src/helpers/api/session.helpers';
import type {
  AuthSession,
  AuthUser,
  LoginApiData,
  LoginApiUser,
  LoginCredentials,
  UserApiItem,
} from '@/src/types/login/auth.types';

/**
 * Auth service abstraction. Swap this implementation for a real HTTP client
 * (fetch/axios) without touching the slice, hooks, or UI — depend on the
 * interface, not the concrete network layer (Dependency Inversion).
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  getCurrentUser(
    uuid: string,
    fallback?: Pick<AuthUser, 'currentWarehouseId' | 'hasMultipleWarehouses'>,
  ): Promise<AuthUser>;
}

function mapApiUserToAuthUser(
  user: UserApiItem,
  fallback?: Pick<AuthUser, 'currentWarehouseId' | 'hasMultipleWarehouses'>,
): AuthUser {
  return {
    id: String(user.id),
    uuid: user.uuid,
    username: user.email,
    displayName: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isTosolUser: user.is_tosol_user,
    isSellerUser: user.is_seller_user,
    isActive: user.is_active,
    lastLoginAt: user.last_login_at,
    seller: user.seller,
    warehouses: user.warehouses ?? [],
    currentWarehouseId: normalizeWarehouseId(
      user.current_warehouse_id ?? fallback?.currentWarehouseId ?? null,
    ),
    hasMultipleWarehouses:
      user.has_multiple_warehouses ?? fallback?.hasMultipleWarehouses ?? false,
  };
}

function mapLoginResponse(data: LoginApiData): AuthSession {
  return {
    user: mapApiUserToAuthUser(data.user),
    token: data.token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    tokenExpiresAt: computeTokenExpiresAt(data.expires_in),
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

  async getCurrentUser(
    uuid: string,
    fallback?: Pick<AuthUser, 'currentWarehouseId' | 'hasMultipleWarehouses'>,
  ): Promise<AuthUser> {
    const data = await getJson<UserApiItem>(apiEndpoints.userDetail(uuid), {
      include: userDetailInclude,
    });

    return mapApiUserToAuthUser(data, fallback);
  }
}

export const authService: IAuthService = new HttpAuthService();
