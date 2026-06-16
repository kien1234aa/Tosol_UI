/**
 * Path đăng ký thiết bị nhận push — cùng API với web: `POST .../api/v1/device-tokens`.
 * Web gọi thêm Firebase Installations + `fcmregistrations.googleapis.com` (Web Push); app native
 * chỉ cần token từ `@react-native-firebase/messaging` rồi POST vào đây.
 */
export const FCM_TOKEN_REGISTER_PATH: string | null = '/device-tokens';
