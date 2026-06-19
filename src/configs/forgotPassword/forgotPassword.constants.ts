/** Static copy for the forgot-password screen. */
export const forgotPasswordCopy = {
  title: 'Quên mật khẩu',
  subtitle: 'Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu',
  emailPlaceholder: 'Email',
  submit: 'Gửi yêu cầu',
  rememberPasswordPrompt: 'Bạn đã nhớ mật khẩu?',
  loginCta: 'Đăng nhập',
  backLabel: 'Quay lại',
  successTitle: 'Thành công',
  successMessage: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
} as const;

export const forgotPasswordValidationMessages = {
  emailRequired: 'Vui lòng nhập email',
  emailInvalid: 'Email không hợp lệ',
} as const;

export const forgotPasswordRules = {
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
