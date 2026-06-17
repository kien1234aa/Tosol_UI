import { emptyUserProfile, personalInfoCopy } from '@/src/configs/profile';
import type { AuthUser } from '@/src/types/login/auth.types';
import type {
  PersonalInfoFormValues,
  PersonalInfoValidationErrors,
  UserProfile,
} from '@/src/types/profile/profile.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+84|0)\d{8,10}$/;

export function buildUserProfile(user: AuthUser | null): UserProfile {
  if (!user) {
    return { ...emptyUserProfile };
  }

  return {
    fullName: user.displayName,
    username: user.email,
    email: user.email,
    phone: user.phone?.trim() || user.seller?.phone?.trim() || '',
    address: user.seller?.address ?? '',
  };
}

/** Ưu tiên chỉnh sửa local; fallback dữ liệu từ API khi chưa lưu. */
export function mergeUserProfile(
  fromAuth: UserProfile,
  storedProfile: UserProfile,
): UserProfile {
  return {
    fullName: storedProfile.fullName || fromAuth.fullName,
    username: storedProfile.username || fromAuth.username,
    email: storedProfile.email || fromAuth.email,
    phone: storedProfile.phone || fromAuth.phone,
    address: storedProfile.address || fromAuth.address,
  };
}

export function toPersonalInfoFormValues(
  profile: UserProfile,
): PersonalInfoFormValues {
  return {
    fullName: profile.fullName,
    username: profile.username,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
  };
}

export function validatePersonalInfoForm(
  values: PersonalInfoFormValues,
): PersonalInfoValidationErrors {
  const errors: PersonalInfoValidationErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = personalInfoCopy.fullNameRequired;
  }

  const email = values.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = personalInfoCopy.emailInvalid;
  }

  const phone = values.phone.trim();
  if (phone && !PHONE_PATTERN.test(phone.replace(/\s/g, ''))) {
    errors.phone = personalInfoCopy.phoneInvalid;
  }

  if (!values.address.trim()) {
    errors.address = personalInfoCopy.addressRequired;
  }

  return errors;
}

export function isPersonalInfoValid(
  errors: PersonalInfoValidationErrors,
): boolean {
  return Object.keys(errors).length === 0;
}

export function formatUserRole(role: string): string {
  return (
    {
      admin: 'Quản trị viên',
      seller: 'Người bán',
      staff: 'Nhân viên',
    }[role] ?? role
  );
}

export function isAdminUser(role: string | null | undefined): boolean {
  return role === 'admin';
}
