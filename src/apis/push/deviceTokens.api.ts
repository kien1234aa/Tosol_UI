import { Platform } from 'react-native';
import { postJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type { DeviceTokenRegisterPayload } from '@/src/types/push/deviceToken.types';

function buildDeviceTokenPayload(token: string): DeviceTokenRegisterPayload {
  return {
    token,
    device_type: Platform.OS === 'ios' ? 'ios' : 'android',
    device_name: `Tosol UI ${Platform.OS}/${String(Platform.Version)}`,
  };
}

export async function registerDeviceToken(token: string): Promise<void> {
  const trimmed = token.trim();

  if (!trimmed) {
    throw new Error('FCM token không hợp lệ');
  }

  await postJson<unknown>(
    apiEndpoints.deviceTokens,
    buildDeviceTokenPayload(trimmed),
  );
}
