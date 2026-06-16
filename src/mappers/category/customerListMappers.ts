import type { CustomerListItemApi } from '@services/category/customerApiTypes';
import type { CustomerListRow } from '@features/category/customers/customerListTypes';

function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toLocaleDateString('vi-VN');
}

function addrLabel(c: CustomerListItemApi): string | null {
  const fa = c.full_address?.trim();
  if (fa) {
    return fa;
  }
  const a = c.address?.trim();
  return a && a.length > 0 ? a : null;
}

/** Dòng liên hệ gọn cho card — null khi không có thông tin. */
function contactLine(c: CustomerListItemApi): string | null {
  const phone = c.phone?.trim();
  const email = c.email?.trim();
  if (phone && email) {
    return `${phone} · ${email}`;
  }
  if (phone) {
    return phone;
  }
  if (email) {
    return email;
  }
  return null;
}

export function customerApiToRow(c: CustomerListItemApi): CustomerListRow {
  const n = Math.max(0, Math.round(Number(c.sale_orders_count ?? 0)));
  return {
    id: c.id,
    key: `cust-${c.id}`,
    name: c.name?.trim() || '—',
    phoneLabel: c.phone?.trim() || null,
    emailLabel: c.email?.trim() || null,
    addressLabel: addrLabel(c),
    contactLabel: contactLine(c),
    ordersCount: n,
    createdLabel: fmtDate(c.created_at),
  };
}
