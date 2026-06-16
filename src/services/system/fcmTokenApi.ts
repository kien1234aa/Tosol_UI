import { isAxiosError } from 'axios';
import { Platform } from 'react-native';
import api from '@shared/services/api';
import { FCM_TOKEN_REGISTER_PATH } from '@features/push/fcmBackendConfig';

/** Khá»›p payload web: `POST /api/v1/device-tokens` */
export type DeviceTokenRegisterBody = {
  token: string;
  device_type: 'android' | 'ios' | 'web';
  device_name: string;
};

function buildDeviceTokenBody(token: string): DeviceTokenRegisterBody {
  const device_type = Platform.OS === 'ios' ? 'ios' : 'android';
  const device_name = `TOSOL React Native ${Platform.OS}/${String(
    Platform.Version,
  )}`;
  return { token, device_type, device_name };
}

/**
 * Gá»­i FCM token lĂªn API TOSOL (Bearer tá»« interceptor).
 * Tráº£ vá» true náº¿u POST thĂ nh cĂ´ng.
 */
export async function postFcmTokenToBackend(token: string): Promise<boolean> {
  const path = (FCM_TOKEN_REGISTER_PATH ?? '').trim();
  if (!path) {
    return false;
  }
  if (typeof token !== 'string' || token.length === 0) {
    if (__DEV__) {
      console.warn(
        '[FCM] postFcmTokenToBackend: token rá»—ng hoáº·c khĂ´ng há»£p lá»‡, bá» qua POST',
      );
    }
    return false;
  }

  const body = buildDeviceTokenBody(token);
  /** Chuá»—i JSON tÆ°á»ng minh â€” trĂ¡nh edge case RN/XHR khĂ´ng serialize object `data`. */
  const data = JSON.stringify(body);

  try {
    if (__DEV__) {
      console.log('[FCM] POST device-tokens', {
        path,
        device_type: body.device_type,
        device_name: body.device_name,
        tokenLength: body.token.length,
        bodyBytes: data.length,
      });
    }

    await api.request({
      method: 'POST',
      url: path,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (e: unknown) {
    if (__DEV__) {
      const status = isAxiosError(e) ? e.response?.status : undefined;
      const msg = isAxiosError(e)
        ? typeof e.response?.data === 'object' &&
          e.response?.data != null &&
          'message' in e.response.data
          ? String((e.response.data as { message?: unknown }).message)
          : e.message
        : String(e);
      console.warn('[FCM] POST token failed', { status, msg });
    }
    return false;
  }
}

