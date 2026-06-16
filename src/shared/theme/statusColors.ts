import type { AppColorPalette } from './colorPalettes';

/** Vai trò màu trạng thái — đồng bộ palette, tách khỏi brand vàng. */
export type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type StatusPaint = {
  fg: string;
  bg: string;
  border: string;
};

export function statusPaint(
  c: AppColorPalette,
  tone: StatusTone,
): StatusPaint {
  switch (tone) {
    case 'success':
      return { fg: c.green, bg: c.greenBg, border: c.greenBorder };
    case 'warning':
      return { fg: c.orange, bg: c.orangeBg, border: c.orangeBorder };
    case 'danger':
      return { fg: c.red, bg: c.redBg, border: c.redBorder };
    case 'info':
      return { fg: c.blue, bg: c.blueBg, border: c.blueBorder };
    default:
      return {
        fg: c.textMuted,
        bg: c.statusNeutralBg,
        border: c.border,
      };
  }
}

/** Nền + chữ cho pill danh sách (OrderStatusPill, …). */
export function statusPillPair(
  c: AppColorPalette,
  tone: StatusTone,
): { bg: string; color: string } {
  const p = statusPaint(c, tone);
  return { bg: p.bg, color: p.fg };
}

/** Nền + viền cho badge bảng / thẻ. */
export function statusSurface(
  c: AppColorPalette,
  tone: StatusTone,
): { backgroundColor: string; borderColor: string } {
  const p = statusPaint(c, tone);
  return { backgroundColor: p.bg, borderColor: p.border };
}
