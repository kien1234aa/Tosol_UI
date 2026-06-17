export interface ForegroundPushBannerPayload {
  title: string;
  body: string;
  onPress?: () => void;
}

type ForegroundPushBannerListener = (payload: ForegroundPushBannerPayload) => void;

let listener: ForegroundPushBannerListener | null = null;

export function setForegroundPushBannerListener(
  next: ForegroundPushBannerListener | null,
): void {
  listener = next;
}

export function showForegroundPushBanner(
  payload: ForegroundPushBannerPayload,
): void {
  listener?.(payload);
}
