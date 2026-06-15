/** Static copy and mock values for the profile tab. */
export const profileCopy = {
  greeting: 'Xin chào',
  balancePrefix: 'Số dư:',
  accountSection: 'Quản lý tài khoản',
  personalInfo: 'Thông tin cá nhân',
  changePassword: 'Thay đổi mật khẩu',
  deleteAccount: 'Xoá tài khoản',
  deliverySection: 'Giao hàng',
  createDeliveryRequest: 'Tạo yêu cầu giao hàng',
  deliveryRequestList: 'Danh sách yêu cầu giao hàng',
  supportSection: 'Nhân viên chăm sóc',
  supportStaffName: 'Phong Đà Logistics',
  supportPhone: '0844.713.555',
  hotline: 'Hotline hỗ trợ: 0844.713.555 - 0823.943.777',
  logout: 'Đăng xuất',
  fallbackName: 'Khách',
  notifications: 'Thông báo',
  openZalo: 'Mở Zalo',
  callSupport: 'Gọi điện',
  featureComingSoon: 'Tính năng đang được phát triển',
} as const;

export const personalInfoCopy = {
  screenTitle: 'Thông tin cá nhân',
  back: 'Quay lại',
  avatarHint: 'Ảnh đại diện',
  changeAvatar: 'Thay đổi ảnh',
  fullNameLabel: 'Họ và tên',
  fullNamePlaceholder: 'Nhập họ và tên',
  usernameLabel: 'Tên đăng nhập',
  emailLabel: 'Email',
  emailPlaceholder: 'Nhập email',
  phoneLabel: 'Số điện thoại',
  phonePlaceholder: 'Nhập số điện thoại',
  addressLabel: 'Địa chỉ nhận hàng',
  addressPlaceholder: 'Nhập địa chỉ nhận hàng',
  save: 'Lưu thông tin',
  saveSuccess: 'Đã cập nhật thông tin cá nhân',
  fullNameRequired: 'Vui lòng nhập họ và tên',
  emailInvalid: 'Email không hợp lệ',
  phoneInvalid: 'Số điện thoại không hợp lệ',
  addressRequired: 'Vui lòng nhập địa chỉ nhận hàng',
} as const;

export const changePasswordCopy = {
  screenTitle: 'Thay đổi mật khẩu',
  back: 'Quay lại',
  subtitle:
    'Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản của bạn.',
  currentPasswordLabel: 'Mật khẩu hiện tại',
  currentPasswordPlaceholder: 'Nhập mật khẩu hiện tại',
  newPasswordLabel: 'Mật khẩu mới',
  newPasswordPlaceholder: 'Nhập mật khẩu mới',
  confirmPasswordLabel: 'Xác nhận mật khẩu mới',
  confirmPasswordPlaceholder: 'Nhập lại mật khẩu mới',
  submit: 'Cập nhật mật khẩu',
  submitSuccess: 'Đã thay đổi mật khẩu thành công',
  currentPasswordRequired: 'Vui lòng nhập mật khẩu hiện tại',
  currentPasswordIncorrect: 'Mật khẩu hiện tại không đúng',
  newPasswordRequired: 'Vui lòng nhập mật khẩu mới',
  newPasswordTooShort: 'Mật khẩu mới phải có ít nhất 6 ký tự',
  newPasswordSameAsCurrent: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu mới',
  confirmPasswordMismatch: 'Mật khẩu xác nhận không khớp',
} as const;

export const changePasswordRules = {
  minPasswordLength: 6,
  mockWrongPassword: 'wrong',
} as const;

/** Default mock profile merged with the authenticated user on load. */
export const mockUserProfile = {
  fullName: 'Phong Đà',
  username: 'PD 1991',
  email: 'pd1991@phongdalogistics.vn',
  phone: '0901234567',
  address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
} as const;

/** Mock wallet balance shown in the profile header. */
export const mockProfileBalanceVnd = 0;

export const profileSupportLinks = {
  zaloPhone: '0844713555',
  hotlinePrimary: '0844713555',
  hotlineSecondary: '0823943777',
} as const;
