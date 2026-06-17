import {
  deleteJson,
  getJson,
  getJsonPaginated,
  patchJson,
  postJson,
  postJsonAction,
  type PaginationMeta,
} from '@/src/apis/http';
import {
  apiEndpoints,
  staffListPageSize,
  staffListSort,
  userDetailInclude,
} from '@/src/configs/api';
import type { UserApiItem } from '@/src/types/login/auth.types';
import type {
  ChangeStaffPasswordPayload,
  StaffApiItem,
  StaffListParams,
  UpdateStaffPayload,
} from '@/src/types/profile/staff.types';

export interface IUsersService {
  listStaff(
    params?: StaffListParams,
  ): Promise<{ data: StaffApiItem[]; meta: PaginationMeta }>;
  getDetail(uuid: string): Promise<UserApiItem>;
  update(uuid: string, payload: UpdateStaffPayload): Promise<UserApiItem>;
  changePassword(
    uuid: string,
    payload: ChangeStaffPasswordPayload,
  ): Promise<void>;
  deactivate(uuid: string): Promise<StaffApiItem>;
  activate(uuid: string): Promise<StaffApiItem>;
  delete(uuid: string): Promise<void>;
}

class HttpUsersService implements IUsersService {
  async listStaff(
    params: StaffListParams = {},
  ): Promise<{ data: StaffApiItem[]; meta: PaginationMeta }> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? staffListPageSize;

    return getJsonPaginated<StaffApiItem[]>(apiEndpoints.users, {
      page,
      per_page: perPage,
      sort: staffListSort,
    });
  }

  async getDetail(uuid: string): Promise<UserApiItem> {
    const id = uuid.trim();
    if (!id) {
      throw new Error('Thiếu mã định danh người dùng');
    }

    return getJson<UserApiItem>(apiEndpoints.userDetail(id), {
      include: userDetailInclude,
    });
  }

  async update(uuid: string, payload: UpdateStaffPayload): Promise<UserApiItem> {
    const id = uuid.trim();
    if (!id) {
      throw new Error('Thiếu mã định danh người dùng');
    }

    return patchJson<UserApiItem>(apiEndpoints.userDetail(id), {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      role: payload.role,
    });
  }

  async changePassword(
    uuid: string,
    payload: ChangeStaffPasswordPayload,
  ): Promise<void> {
    const id = uuid.trim();
    if (!id) {
      throw new Error('Thiếu mã định danh người dùng');
    }

    await postJsonAction(`${apiEndpoints.userDetail(id)}/change-password`, {
      current_password: payload.current_password,
      new_password: payload.new_password,
      new_password_confirmation: payload.new_password_confirmation,
    });
  }

  async deactivate(uuid: string): Promise<StaffApiItem> {
    const id = uuid.trim();
    if (!id) {
      throw new Error('Thiếu mã định danh người dùng');
    }

    return postJson<StaffApiItem>(`${apiEndpoints.userDetail(id)}/deactivate`, {});
  }

  async activate(uuid: string): Promise<StaffApiItem> {
    const id = uuid.trim();
    if (!id) {
      throw new Error('Thiếu mã định danh người dùng');
    }

    return postJson<StaffApiItem>(`${apiEndpoints.userDetail(id)}/activate`, {});
  }

  async delete(uuid: string): Promise<void> {
    const id = uuid.trim();
    if (!id) {
      throw new Error('Thiếu mã định danh người dùng');
    }

    await deleteJson(apiEndpoints.userDetail(id));
  }
}

export const usersService: IUsersService = new HttpUsersService();
