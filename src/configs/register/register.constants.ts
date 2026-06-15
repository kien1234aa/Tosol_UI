/** Static copy for the registration screen. */
export const registerCopy = {
  title: 'Đăng ký tài khoản mới',
  usernamePlaceholder: 'Tên đăng nhập',
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Mật khẩu',
  confirmPasswordPlaceholder: 'Nhập lại mật khẩu',
  submit: 'Đăng ký',
  hasAccountPrompt: 'Bạn đã có tài khoản?',
  loginCta: 'Đăng nhập!',
} as const;

export const registerValidationMessages = {
  usernameRequired: 'Vui lòng nhập tên đăng nhập',
  emailRequired: 'Vui lòng nhập email',
  emailInvalid: 'Email không hợp lệ',
  passwordRequired: 'Vui lòng nhập mật khẩu',
  passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
  confirmPasswordRequired: 'Vui lòng nhập lại mật khẩu',
  confirmPasswordMismatch: 'Mật khẩu không khớp',
} as const;

export const registerRules = {
  minPasswordLength: 6,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
