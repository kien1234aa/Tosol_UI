export type ForegroundPushBannerPayload = {
  title: string;
  body: string;
  duration?: number;
  onPress?: () => void;
};

type ShowForegroundPushBannerFn = (payload: ForegroundPushBannerPayload) => void;

let showForegroundPushBannerFn: ShowForegroundPushBannerFn | null = null;

export function registerForegroundPushBannerHost(
  show: ShowForegroundPushBannerFn | null,
): void {
  showForegroundPushBannerFn = show;
}

export function showForegroundPushBanner(
  payload: ForegroundPushBannerPayload,
): void {
  showForegroundPushBannerFn?.(payload);
}
