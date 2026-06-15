/** Static copy for the forgot-password screen. */
export const forgotPasswordCopy = {
  title: 'Quên mật khẩu',
  subtitle: 'Nhập email đã đăng ký để nhận mã xác nhận',
  emailPlaceholder: 'Email',
  submit: 'Gửi yêu cầu',
  rememberPasswordPrompt: 'Bạn đã nhớ mật khẩu?',
  loginCta: 'Đăng nhập',
} as const;

export const forgotPasswordValidationMessages = {
  emailRequired: 'Vui lòng nhập email',
  emailInvalid: 'Email không hợp lệ',
} as const;

export const forgotPasswordRules = {
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
