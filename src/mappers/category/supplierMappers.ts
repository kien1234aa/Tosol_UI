import type { SupplierApi } from '@services/category/supplierApiTypes';
import type { SupplierListRow, SupplierRowStatus } from '@features/category/suppliers/supplierTypes';

function fmtDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

/** Dòng liên hệ gọn cho card — null khi không có thông tin. */
function contactLine(s: SupplierApi): string | null {
  const person = s.contact_person?.trim();
  const phone = s.phone?.trim();
  const email = s.email?.trim();
  const contactParts: string[] = [];

  if (phone && email) {
    contactParts.push(`${phone} · ${email}`);
  } else if (phone) {
    contactParts.push(phone);
  } else if (email) {
    contactParts.push(email);
  }

  if (person && contactParts.length > 0) {
    return `${person} · ${contactParts.join(' · ')}`;
  }
  if (person) {
    return person;
  }
  if (contactParts.length > 0) {
    return contactParts.join(' · ');
  }
  return null;
}

export function supplierApiToRow(s: SupplierApi): SupplierListRow {
  const status: SupplierRowStatus = s.is_active ? 'active' : 'inactive';
  const code = s.code?.trim() ?? '';
  return {
    id: s.id,
    key: `sup-${s.id}`,
    codeLabel: code,
    name: s.name?.trim() || '—',
    contactLabel: contactLine(s),
    purchaseOrdersCount: Math.max(
      0,
      Math.round(Number(s.purchase_orders_count ?? 0)),
    ),
    status,
    createdLabel: fmtDate(s.created_at),
  };
}
