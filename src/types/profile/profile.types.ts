/** Editable personal information shown on the profile detail screen. */

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
}

export interface PersonalInfoFormValues {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
}

export interface PersonalInfoValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
}
