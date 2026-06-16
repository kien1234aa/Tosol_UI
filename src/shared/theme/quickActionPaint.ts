import type { AppColorPalette } from './colorPalettes';

/** Vai trò màu thống nhất cho nút “Thao tác nhanh” trên mọi màn. */
export type QuickActionTone = 'neutral' | 'success' | 'warning' | 'danger';

export type QuickActionPaint = {
  bg: string;
  fg: string;
  border: string;
};

export function quickActionPaint(
  c: AppColorPalette,
  tone: QuickActionTone,
): QuickActionPaint {
  switch (tone) {
    case 'success':
      return {
        bg: c.quickActionSuccessBg,
        fg: c.quickActionSuccessFg,
        border: c.quickActionSuccessBorder,
      };
    case 'warning':
      return {
        bg: c.quickActionWarningBg,
        fg: c.quickActionWarningFg,
        border: c.quickActionWarningBorder,
      };
    case 'danger':
      return {
        bg: c.quickActionDangerBg,
        fg: c.quickActionDangerFg,
        border: c.quickActionDangerBorder,
      };
    case 'neutral':
    default:
      return {
        bg: c.quickActionNeutralBg,
        fg: c.quickActionNeutralFg,
        border: c.quickActionNeutralBorder,
      };
  }
}
