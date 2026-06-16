import React, { useMemo } from 'react';
import { CanvasDetailQuickDock } from '@shared/components/ui/canvasDetail/CanvasDetailQuickDock';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet } from 'react-native';
import type { TransferOrderApi } from '@services/warehouse/transferOrderApiTypes';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';

export type TransferOrderDetailOverviewSectionProps = {
  t: TransferOrderApi;
};

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function formatWeightG(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n <= 0) {
    return '—';
  }
  return `${n.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} g`;
}

export function TransferOrderDetailOverviewSection({
  t,
}: TransferOrderDetailOverviewSectionProps) {
  const outboundC = useMemo(
    () => toNum(t.outbound_orders_count),
    [t.outbound_orders_count],
  );
  const inboundC = useMemo(
    () => toNum(t.inbound_orders_count),
    [t.inbound_orders_count],
  );

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        {
          label: 'Sản phẩm',
          value: String(toNum(t.total_items)),
          icon: 'cube',
        },
        {
          label: 'Số lượng',
          value: String(toNum(t.total_quantity)),
          icon: 'layers',
        },
      ]}
      timeline={{
        label: 'Khối lượng',
        value: formatWeightG(t.total_weight),
        hint: `${outboundC} xuất · ${inboundC} nhập`,
      }}
      title="Tổng quan chuyển kho"
      icon="compare"
    >
      <DetailRow label="Phiếu xuất kho" value={String(outboundC)} />
      <DetailRow label="Phiếu nhập kho" value={String(inboundC)} last />
    </CanvasDetailOverviewPanel>
  );
}

export function TransferOrderDetailQuickDock() {
  return (
    <CanvasDetailQuickDock
      stackOnly
      actions={[
        {
          key: 'review',
          label: 'Xem lại bàn giao',
          icon: 'eye',
          tone: 'neutral',
          disabled: true,
        },
      ]}
    />
  );
}

function create_TransferOrderDetailScrollFooter_styles(c: AppColorPalette) {
  return StyleSheet.create({
    overviewWrap: {
      marginBottom: 10,
      paddingHorizontal: 16,
    },
    sectionCard: {
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textSecondary,
      marginBottom: 10,
    },
  });
}
