import { staffDetailCopy } from '@/src/configs/profile';
import { formatUserRole } from '@/src/helpers/profile/profile.helpers';
import type { UserApiItem } from '@/src/types/login/auth.types';
import type {
  StaffApiItem,
  StaffDetailItem,
  StaffListItem,
} from '@/src/types/profile/staff.types';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function mapStaffApiItemToListItem(item: StaffApiItem): StaffListItem {
  return {
    id: item.id,
    uuid: item.uuid,
    name: item.name,
    email: item.email,
    phone: item.phone?.trim() ?? '',
    role: item.role,
    roleLabel: formatUserRole(item.role),
    isActive: item.is_active,
    lastLoginAt: item.last_login_at,
  };
}

export function mapStaffApiItemsToListItems(items: StaffApiItem[]): StaffListItem[] {
  return items.map(mapStaffApiItemToListItem);
}

export function mapStaffDetailApiToItem(item: UserApiItem): StaffDetailItem {
  return {
    id: item.id,
    uuid: item.uuid,
    name: item.name,
    email: item.email,
    phone: item.phone?.trim() ?? '',
    role: item.role,
    roleLabel: formatUserRole(item.role),
    isActive: item.is_active,
    isTosolUser: item.is_tosol_user,
    isSellerUser: item.is_seller_user,
    emailVerifiedAt: item.email_verified_at ?? null,
    lastLoginAt: item.last_login_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at ?? item.created_at,
    sellerName: item.seller?.name?.trim() || '—',
    sellerPhone: item.seller?.phone?.trim() || '',
    warehouseCount: item.warehouses?.length ?? 0,
  };
}

export function formatStaffDateTime(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return DATE_TIME_FORMATTER.format(date);
}

export function formatStaffLastLogin(value: string | null | undefined): string {
  if (!value?.trim()) {
    return staffDetailCopy.neverLoggedIn;
  }

  return formatStaffDateTime(value);
}

export function staffNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function staffRoleToFormValue(role: string): 'admin' | 'staff' {
  return role.trim().toLowerCase() === 'admin' ? 'admin' : 'staff';
}
