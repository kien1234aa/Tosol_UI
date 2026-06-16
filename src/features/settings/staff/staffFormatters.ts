import type { StaffUserRole } from '@services/settings/staffApiTypes';

export function staffNameInitials(name: string): string {
  const t = name.trim();
  if (!t) {
    return '?';
  }
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.charAt(0) ?? '';
    const b = parts[parts.length - 1]?.charAt(0) ?? '';
    return (a + b).toUpperCase();
  }
  if (t.length >= 2) {
    return t.slice(0, 2).toUpperCase();
  }
  return t.slice(0, 1).toUpperCase();
}

export function staffRoleLabel(role: StaffUserRole): string {
  const r = String(role).trim().toLowerCase();
  if (r === 'admin') {
    return 'Quản lý (nhà bán)';
  }
  if (r === 'staff') {
    return 'Nhân viên (nhà bán)';
  }
  return role || '—';
}

export function formatStaffLastLogin(iso: string | null | undefined): string {
  if (iso == null || !String(iso).trim()) {
    return 'Chưa từng';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return 'Chưa từng';
  }
  return d.toLocaleDateString('vi-VN');
}

export function formatStaffCreatedDateVi(
  iso: string | null | undefined,
): string {
  if (iso == null || !String(iso).trim()) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

/** Gợi ý dòng timeline "Đã tạo … trước". */
export function formatStaffCreatedRelative(
  iso: string | null | undefined,
): string {
  if (iso == null || !String(iso).trim()) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return 'Vừa tạo';
  }
  if (mins < 60) {
    return `Đã tạo ${mins} phút trước`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) {
    return `Đã tạo ${hrs} giờ trước`;
  }
  const days = Math.floor(hrs / 24);
  if (days < 14) {
    return `Đã tạo ${days} ngày trước`;
  }
  return `Đã tạo ${d.toLocaleDateString('vi-VN')}`;
}
