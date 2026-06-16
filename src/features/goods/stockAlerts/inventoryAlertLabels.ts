import type { StatusPillTone } from '@shared/components/ui/StatusPill';

/** Nhãn `alert_types[]` — GET `/inventory/alerts`. */
export function inventoryAlertTypeLabelVi(code: string): string {
  const c = code.trim();
  switch (c) {
    case 'out_of_stock':
      return 'Hết hàng';
    case 'low_stock':
      return 'Sắp hết hàng';
    case 'near_expiry':
      return 'Sắp hết hạn';
    default:
      return c.length > 0 ? c : '—';
  }
}

export function inventoryAlertSeverityLabelVi(sev: string): string {
  const s = sev.trim().toLowerCase();
  switch (s) {
    case 'critical':
      return 'Nghiêm trọng';
    case 'high':
      return 'Cao';
    case 'medium':
    case 'moderate':
      return 'Trung bình';
    case 'low':
      return 'Thấp';
    default:
      return sev.length > 0 ? sev : '—';
  }
}

export function severityToPillTone(sev: string): StatusPillTone {
  const s = sev.trim().toLowerCase();
  if (s === 'critical') {
    return 'danger';
  }
  if (s === 'high') {
    return 'warning';
  }
  if (s === 'low' || s === 'medium' || s === 'moderate') {
    return 'info';
  }
  return 'neutral';
}

export function alertTypeToPillTone(code: string): StatusPillTone {
  const c = code.trim();
  if (c === 'out_of_stock') {
    return 'danger';
  }
  if (c === 'low_stock') {
    return 'warning';
  }
  if (c === 'near_expiry') {
    return 'info';
  }
  return 'neutral';
}
