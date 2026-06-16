import React from 'react';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { CanvasDetailQuickDock, type CanvasDetailQuickDockAction } from '@shared/components/ui/canvasDetail/CanvasDetailQuickDock';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { CustomerDetailApi } from '@services/category/customerApiTypes';

export type CustomerDetailOverviewSectionProps = {
  customer: CustomerDetailApi;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('vi-VN');
}

function strOrDash(v: string | null | undefined): string {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : '—';
}

function fmtPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) {
    return '—';
  }
  const d = phone.replace(/\D/g, '');
  if (d.length >= 10) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`.trim();
  }
  return phone.trim();
}

function sellerLabel(c: CustomerDetailApi): string {
  const s = c.seller;
  if (s && typeof s === 'object') {
    const n = typeof s.name === 'string' ? s.name.trim() : '';
    if (n.length > 0) {
      return n;
    }
  }
  return '—';
}

export function CustomerDetailOverviewSection({
  customer,
}: CustomerDetailOverviewSectionProps) {
  const orders = (customer.sale_orders_count ?? 0).toLocaleString('vi-VN');

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        { label: 'Đơn hàng', value: orders, icon: 'cart' },
        { label: 'Điện thoại', value: fmtPhoneDisplay(customer.phone), icon: 'call' },
      ]}
      timeline={{
        label: 'Seller',
        value: sellerLabel(customer),
        hint: strOrDash(customer.email),
      }}
      title="Thông tin khách hàng"
      icon="person"
    >
      <DetailRow label="Tên" value={customer.name} />
      <DetailRow label="Email" value={strOrDash(customer.email)} />
      <DetailRow label="Ngày tạo" value={fmtDate(customer.created_at)} />
      <DetailRow label="Cập nhật" value={fmtDate(customer.updated_at)} last />
    </CanvasDetailOverviewPanel>
  );
}

export type CustomerDetailQuickDockProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  submitting?: boolean;
};

export function CustomerDetailQuickDock({
  onEdit,
  onDelete,
  submitting = false,
}: CustomerDetailQuickDockProps) {
  const actions: CanvasDetailQuickDockAction[] = [
    {
      key: 'edit',
      label: 'Sửa khách hàng',
      icon: 'pencil',
      variant: 'primary',
      disabled: !onEdit || submitting,
      onPress: () => onEdit?.(),
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: 'trash',
      tone: 'danger',
      disabled: !onDelete || submitting,
      onPress: () => onDelete?.(),
    },
  ];

  return <CanvasDetailQuickDock actions={actions} />;
}

