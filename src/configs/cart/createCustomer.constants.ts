import type { CreateCustomerFormState } from '@/src/types/customers/customer.types';

export const createCustomerCopy = {
  title: 'Tạo khách hàng',
  nameLabel: 'Tên khách hàng',
  namePlaceholder: 'Tên khách hàng *',
  phoneLabel: 'Điện thoại',
  phonePlaceholder: 'Điện thoại *',
  emailLabel: 'Email',
  emailPlaceholder: 'Email',
  addressLabel: 'Địa chỉ',
  addressPlaceholder: 'Số nhà, tên đường',
  createButton: 'Tạo khách hàng',
  submit: 'Tạo Mới',
  cancel: 'Hủy',
  nameRequired: 'Vui lòng nhập tên khách hàng',
  phoneRequired: 'Vui lòng nhập số điện thoại',
  emailInvalid: 'Email không hợp lệ',
  submitError: 'Không thể tạo khách hàng',
  submitSuccessTitle: 'Tạo khách hàng thành công',
} as const;

export const defaultCreateCustomerFormState: CreateCustomerFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  provinceId: null,
  districtId: null,
  wardId: null,
};
