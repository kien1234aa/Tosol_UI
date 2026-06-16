import type { SellerShippingPartnerNestedApi } from '@services/settings/shipApiTypes';
import type { FormMenuOption } from '../shops/components/FormMenuSelect';

const FALLBACK_SERVICE_OPTIONS: FormMenuOption<string>[] = [
  { key: 'STD', label: 'STD — Chuẩn' },
  { key: 'EXP', label: 'EXP — Giao nhanh' },
  { key: 'ECONOMY', label: 'Economy' },
  { key: 'COD', label: 'COD' },
];

export function buildDefaultServiceOptions(
  partner: SellerShippingPartnerNestedApi,
  currentDefault: string | null,
): FormMenuOption<string>[] {
  const raw = partner.supported_services;
  const parsed: FormMenuOption<string>[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && item.trim()) {
        const k = item.trim();
        parsed.push({ key: k, label: k });
        continue;
      }
      if (item != null && typeof item === 'object' && !Array.isArray(item)) {
        const o = item as Record<string, unknown>;
        const code = String(o.code ?? o.id ?? o.value ?? '').trim();
        if (!code) {
          continue;
        }
        const name = String(o.name ?? o.label ?? '').trim();
        parsed.push({
          key: code,
          label: name && name !== code ? `${code} — ${name}` : code,
        });
      }
    }
  }

  const base = parsed.length > 0 ? parsed : [...FALLBACK_SERVICE_OPTIONS];
  const cur = currentDefault?.trim();
  if (cur && !base.some(o => o.key === cur)) {
    return [{ key: cur, label: cur }, ...base];
  }
  return base;
}

export function isBestExpressPartner(
  partner: SellerShippingPartnerNestedApi,
): boolean {
  const code = partner.code?.trim().toLowerCase() ?? '';
  if (code === 'best-express') {
    return true;
  }
  const n = partner.name?.trim().toLowerCase() ?? '';
  return n.includes('best') && n.includes('express');
}

export const BEST_EXPRESS_CONNECTION_GUIDE = `1. Đăng nhập hệ thống quản lý Best Express (V9) tại https://v9.800best.com
2. Lấy thông tin API / mật khẩu theo hướng dẫn của Best Express
3. Cung cấp Webhook URL và Bearer Token cho nhân viên Best Express để họ cấu hình phía đối tác
4. Lưu cấu hình và bật Hoạt động khi đã kiểm tra thành công`;

export const GENERIC_SHIP_PARTNER_GUIDE =
  'Điền thông tin xác thực theo hướng dẫn của đơn vị vận chuyển. API key / token thường được cấp trong cổng quản trị đối tác.';
