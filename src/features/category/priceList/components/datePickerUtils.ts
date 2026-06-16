/** `Date` → `YYYY-MM-DD` string (date only, no time). */
export function dateToIsoDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** `YYYY-MM-DD` hoặc chuỗi ISO bắt đầu bằng ngày — đổi sang `Date` giờ địa phương (00:00). */
export function isoDateOnlyToLocalDate(
  s: string | null | undefined,
): Date | null {
  if (!s) {
    return null;
  }
  const head = s.length >= 10 ? s.slice(0, 10) : s;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    return null;
  }
  const y = Number(head.slice(0, 4));
  const m = Number(head.slice(5, 7));
  const d = Number(head.slice(8, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }
  return new Date(y, m - 1, d);
}
