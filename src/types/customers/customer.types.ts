/** POST /customers — request payload. */

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
}

export interface CreateCustomerFormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
}
