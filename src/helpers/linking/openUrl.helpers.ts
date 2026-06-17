import { Linking } from 'react-native';

function normalizePhoneForTel(phone: string): string {
  return phone.replace(/[\s.]/g, '');
}

export async function openUrlIfSupported(url: string): Promise<boolean> {
  const trimmed = url.trim();

  if (!trimmed) {
    return false;
  }

  try {
    const canOpen = await Linking.canOpenURL(trimmed);

    if (!canOpen) {
      return false;
    }

    await Linking.openURL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export async function openPhoneCall(phone: string): Promise<boolean> {
  const normalized = normalizePhoneForTel(phone);

  if (!normalized) {
    return false;
  }

  return openUrlIfSupported(`tel:${normalized}`);
}
