/** Static, localized copy for the authentication surface. */
export const authCopy = {
  title: 'Vui lòng đăng nhập tài khoản',
  usernamePlaceholder: 'Tên đăng nhập',
  passwordPlaceholder: 'Mật khẩu',
  rememberMe: 'Nhớ mật khẩu',
  submit: 'Đăng nhập',
  forgotPassword: 'Quên mật khẩu?',
  noAccountPrompt: 'Bạn chưa có tài khoản?',
  registerCta: 'Đăng ký ngay!',
} as const;

/** Validation messages, kept separate so they are easy to localize/test. */
export const authValidationMessages = {
  usernameRequired: 'Vui lòng nhập tên đăng nhập',
  passwordRequired: 'Vui lòng nhập mật khẩu',
  passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
} as const;

export const authRules = {
  minPasswordLength: 6,
} as const;
