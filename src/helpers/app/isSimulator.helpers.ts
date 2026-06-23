import { Platform } from 'react-native';

type AndroidPlatformConstants = {
  Brand?: string;
  Model?: string;
  Fingerprint?: string;
};

/** Android emulator — camera thường không hoạt động ổn định. */
export function isAndroidEmulator(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }

  const constants = Platform.constants as AndroidPlatformConstants;
  const brand = constants.Brand ?? '';
  const model = constants.Model ?? '';
  const fingerprint = constants.Fingerprint ?? '';

  return (
    brand === 'google' &&
    (model.includes('sdk') ||
      model.includes('Emulator') ||
      model.includes('Android SDK') ||
      fingerprint.includes('generic'))
  );
}

/**
 * Môi trường mà camera native thường không dùng được.
 * iOS Simulator bị chặn trong react-native-image-picker (TARGET_OS_SIMULATOR);
 * phát hiện qua errorCode `camera_unavailable` khi người dùng bấm chụp.
 */
export function isCameraBlockedByEnvironment(): boolean {
  return isAndroidEmulator();
}
