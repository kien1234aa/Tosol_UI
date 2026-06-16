import React from 'react';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { CanvasDetailQuickDock } from '@shared/components/ui/canvasDetail/CanvasDetailQuickDock';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet } from 'react-native';
import type { ComboAssemblyApi } from '@services/warehouse/comboAssemblyApiTypes';
import { comboAssemblyPickStrategyLabel } from '@mappers/warehouse/comboAssemblyMappers';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';

export type ComboAssemblyDetailOverviewSectionProps = {
  a: ComboAssemblyApi;
};

function requesterLine(a: ComboAssemblyApi): string {
  return a.requested_by?.name?.trim() || a.requester?.name?.trim() || '—';
}

export function ComboAssemblyDetailOverviewSection({
  a,
}: ComboAssemblyDetailOverviewSectionProps) {
  const strategy = comboAssemblyPickStrategyLabel(a.pick_strategy);

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        { label: 'Người yêu cầu', value: requesterLine(a), icon: 'person' },
        { label: 'Chiến lược', value: strategy, icon: 'funnel' },
      ]}
      timeline={{
        label: 'Yêu cầu lúc',
        value: formatDateTimeVi(a.created_at ?? null),
      }}
      title="Tổng quan đóng gói combo"
      icon="package"
    >
      <DetailRow label="Người yêu cầu" value={requesterLine(a)} />
      <DetailRow
        label="Yêu cầu lúc"
        value={formatDateTimeVi(a.created_at ?? null)}
        last
      />
    </CanvasDetailOverviewPanel>
  );
}

export function ComboAssemblyDetailQuickDock() {
  return (
    <CanvasDetailQuickDock
      stackOnly
      actions={[
        {
          key: 'pack',
          label: 'Đóng gói nhanh',
          icon: 'check',
          tone: 'success',
          onPress: () =>
            toast.info('Thao tác này thực hiện trên web quản lý kho. Ứng dụng di động chỉ xem chi tiết.'),
        },
        {
          key: 'cancel',
          label: 'Huỷ yêu cầu',
          icon: 'close',
          tone: 'danger',
          onPress: () =>
            toast.info('Thao tác này thực hiện trên web quản lý kho. Ứng dụng di động chỉ xem chi tiết.'),
        },
      ]}
    />
  );
}

function create_ComboAssemblyDetailScrollFooter_styles(c: AppColorPalette) {
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
    strategyRow: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    strategyLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 8,
    },
    strategyBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    strategyBadgeTxt: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
    },
  });
}
