import React from 'react';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { quickActionPaint } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { SupplierApi } from '@services/category/supplierApiTypes';

export type SupplierDetailOverviewSectionProps = {
  supplier: SupplierApi;
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

export function SupplierDetailOverviewSection({
  supplier,
}: SupplierDetailOverviewSectionProps) {
  const poCount = (supplier.purchase_orders_count ?? 0).toLocaleString('vi-VN');

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        { label: 'Đơn mua', value: poCount, icon: 'clipboard' },
        {
          label: 'Trạng thái',
          value: supplier.is_active ? 'Hoạt động' : 'Ngưng',
          icon: 'shield',
        },
      ]}
      timeline={{
        label: 'Liên hệ',
        value: fmtPhoneDisplay(supplier.phone),
        hint: strOrDash(supplier.email),
      }}
      title="Thông tin nhà cung cấp"
      icon="business"
    >
      <DetailRow label="Mã" value={strOrDash(supplier.code)} />
      <DetailRow label="Tên" value={supplier.name} />
      <DetailRow label="Email" value={strOrDash(supplier.email)} />
      <DetailRow
        label="Trạng thái"
        value={supplier.is_active ? 'Hoạt động' : 'Ngưng'}
      />
      <DetailRow label="Ngày tạo" value={fmtDate(supplier.created_at)} />
      <DetailRow label="Cập nhật" value={fmtDate(supplier.updated_at)} last />
    </CanvasDetailOverviewPanel>
  );
}

export type SupplierDetailQuickDockProps = {
  supplier: SupplierApi;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
  submitting?: boolean;
};

export function SupplierDetailQuickDock({
  supplier,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  submitting = false,
}: SupplierDetailQuickDockProps) {
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);
  const paintWarning = quickActionPaint(c, 'warning');
  const paintSuccess = quickActionPaint(c, 'success');
  const paintDanger = quickActionPaint(c, 'danger');

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>Thao tác nhanh</Text>
      <View style={qd.dockCol}>
        <Pressable
          onPress={() => onEdit?.()}
          disabled={!onEdit || submitting}
          style={({ pressed }) => [
            qd.dockBtnPrimary,
            pressed && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="pencil" size={18} color="#fff" />
          <Text style={qd.dockBtnPrimaryLabel}>Sửa</Text>
        </Pressable>
        {supplier.is_active ? (
          <Pressable
            onPress={() => onDeactivate?.()}
            disabled={!onDeactivate || submitting}
            style={({ pressed }) => [
              qd.dockBtn,
              {
                backgroundColor: paintWarning.bg,
                borderColor: paintWarning.border,
              },
              pressed && qd.dockBtnPressed,
            ]}
          >
            <SystemIcon name="ban" size={16} color={paintWarning.fg} />
            <Text style={[qd.dockBtnLabel, { color: paintWarning.fg }]}>
              Vô hiệu hóa
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onActivate?.()}
            disabled={!onActivate || submitting}
            style={({ pressed }) => [
              qd.dockBtn,
              {
                backgroundColor: paintSuccess.bg,
                borderColor: paintSuccess.border,
              },
              pressed && qd.dockBtnPressed,
            ]}
          >
            <SystemIcon name="check" size={16} color={paintSuccess.fg} />
            <Text style={[qd.dockBtnLabel, { color: paintSuccess.fg }]}>
              Kích hoạt
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => onDelete?.()}
          disabled={!onDelete || submitting}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: paintDanger.bg,
              borderColor: paintDanger.border,
            },
            pressed && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="trash" size={16} color={paintDanger.fg} />
          <Text style={[qd.dockBtnLabel, { color: paintDanger.fg }]}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}
